import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a" },
  header: { marginBottom: 32 },
  brand: { fontSize: 18, fontWeight: "bold", color: "#111" },
  tagline: { fontSize: 9, color: "#888", marginTop: 2 },
  divider: { borderBottomWidth: 0.5, borderBottomColor: "#e5e5e5", marginVertical: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 9, fontWeight: "bold", color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 100, color: "#666" },
  value: { flex: 1, color: "#111" },
  bubble: { marginBottom: 10, padding: 10, borderRadius: 6 },
  bubbleVisitor: { backgroundColor: "#f4f4f5", marginRight: 40 },
  bubblePro: { backgroundColor: "#3f3f46", marginLeft: 40 },
  bubbleText: { fontSize: 10, lineHeight: 1.5, color: "#1a1a1a" },
  bubbleTextWhite: { fontSize: 10, lineHeight: 1.5, color: "#fff" },
  bubbleMeta: { fontSize: 8, color: "#999", marginTop: 4 },
  bubbleMetaWhite: { fontSize: 8, color: "#ccc", marginTop: 4 },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: "#bbb" },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!tenant) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const admin = createAdminClient();

  const { data: conv } = await admin
    .from("conversations")
    .select("id, visitor_name, visitor_email, visitor_phone, status, created_at")
    .eq("id", conversationId)
    .eq("tenant_id", tenant.id)
    .maybeSingle();
  if (!conv) return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });

  const { data: messages } = await admin
    .from("messages")
    .select("sender, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const { data: profile } = await admin
    .from("professional_profiles")
    .select("name, title, email")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  const dateStr = new Date(conv.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const doc = (
    <Document title={`Orçamento — ${conv.visitor_name}`} author="EngHub">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>EngHub</Text>
          <Text style={styles.tagline}>Plataforma de engenheiros verificados</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 4, color: "#111" }}>Solicitação de Orçamento</Text>
          <Text style={{ fontSize: 10, color: "#666" }}>Gerado em {new Date().toLocaleDateString("pt-BR")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Solicitante</Text>
          <View style={styles.row}><Text style={styles.label}>Nome</Text><Text style={styles.value}>{conv.visitor_name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>E-mail</Text><Text style={styles.value}>{conv.visitor_email}</Text></View>
          {conv.visitor_phone ? (
            <View style={styles.row}><Text style={styles.label}>Telefone</Text><Text style={styles.value}>{conv.visitor_phone}</Text></View>
          ) : null}
          <View style={styles.row}><Text style={styles.label}>Data de contato</Text><Text style={styles.value}>{dateStr}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Status</Text><Text style={styles.value}>{conv.status === "open" ? "Em aberto" : "Encerrada"}</Text></View>
        </View>

        {profile ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profissional</Text>
            <View style={styles.row}><Text style={styles.label}>Nome</Text><Text style={styles.value}>{profile.name ?? "—"}</Text></View>
            {profile.title ? (
              <View style={styles.row}><Text style={styles.label}>Especialidade</Text><Text style={styles.value}>{profile.title}</Text></View>
            ) : null}
            {profile.email ? (
              <View style={styles.row}><Text style={styles.label}>E-mail</Text><Text style={styles.value}>{profile.email}</Text></View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico da Conversa</Text>
          {(messages ?? []).map((msg, i) => {
            const isPro = msg.sender === "professional";
            return (
              <View key={i} style={[styles.bubble, isPro ? styles.bubblePro : styles.bubbleVisitor]}>
                <Text style={isPro ? styles.bubbleTextWhite : styles.bubbleText}>{msg.content}</Text>
                <Text style={isPro ? styles.bubbleMetaWhite : styles.bubbleMeta}>
                  {isPro ? "Profissional" : conv.visitor_name}
                  {" · "}
                  {new Date(msg.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>EngHub — enghub.com.br</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );

  const buffer = await renderToBuffer(doc);
  const filename = `orcamento-${conv.visitor_name.replace(/\s+/g, "-").toLowerCase()}-${conversationId.slice(0, 8)}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
