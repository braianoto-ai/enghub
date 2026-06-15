import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 52, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a", backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  brand: { fontSize: 20, fontWeight: "bold", color: "#111" },
  brandSub: { fontSize: 9, color: "#888", marginTop: 2 },
  docTitle: { fontSize: 11, fontWeight: "bold", color: "#4b5563", textAlign: "right" },
  docDate: { fontSize: 9, color: "#888", textAlign: "right", marginTop: 3 },
  docValidade: { fontSize: 9, color: "#f59e0b", textAlign: "right", marginTop: 2 },
  divider: { borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb", marginVertical: 20 },
  thinDivider: { borderBottomWidth: 0.5, borderBottomColor: "#f3f4f6", marginVertical: 12 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 8, fontWeight: "bold", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  row: { flexDirection: "row", marginBottom: 5 },
  label: { width: 110, color: "#6b7280", fontSize: 9 },
  value: { flex: 1, color: "#111", fontSize: 9 },
  scopeBox: { backgroundColor: "#f9fafb", borderRadius: 4, padding: 14, marginTop: 6 },
  scopeText: { fontSize: 10, color: "#374151", lineHeight: 1.6 },
  valueBox: { backgroundColor: "#f0fdf4", borderRadius: 6, padding: 16, marginTop: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  valueLabel: { fontSize: 10, color: "#15803d" },
  valueAmount: { fontSize: 18, fontWeight: "bold", color: "#15803d" },
  termsList: { marginTop: 6 },
  termItem: { flexDirection: "row", marginBottom: 4 },
  termBullet: { width: 12, color: "#9ca3af", fontSize: 9 },
  termText: { flex: 1, fontSize: 9, color: "#374151", lineHeight: 1.5 },
  signatureSection: { marginTop: 40, flexDirection: "row", justifyContent: "space-between" },
  signatureBlock: { width: "45%" },
  signatureLine: { borderBottomWidth: 0.5, borderBottomColor: "#d1d5db", marginBottom: 6 },
  signatureLabel: { fontSize: 8, color: "#9ca3af", textAlign: "center" },
  signatureName: { fontSize: 9, color: "#374151", textAlign: "center", marginTop: 3 },
  footer: { position: "absolute", bottom: 32, left: 52, right: 52, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: "#d1d5db" },
  badge: { flexDirection: "row", gap: 6 },
  creaTag: { fontSize: 8, color: "#6b7280", backgroundColor: "#f3f4f6", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const { conversationId, title, scope, value, deadline, payment, validity } = body as {
    conversationId: string;
    title: string;
    scope: string;
    value: string;
    deadline: string;
    payment: string;
    validity: string;
  };

  if (!conversationId || !title || !scope) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: tenant } = await admin
    .from("tenants")
    .select("id, name, slug, owner_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tenant) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const { data: conv } = await admin
    .from("conversations")
    .select("visitor_name, visitor_email, visitor_phone")
    .eq("id", conversationId)
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (!conv) return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });

  const { data: prof } = await admin
    .from("professional_profiles")
    .select("name, email, phone, city, state, crea_cau_number, crea_cau_type, education")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const profName = prof?.name ?? tenant.name;
  const crea = prof?.crea_cau_number ? `${prof.crea_cau_type ?? "CREA"} ${prof.crea_cau_number}` : null;
  const location = [prof?.city, prof?.state].filter(Boolean).join(", ");

  const buffer = await renderToBuffer(
    <Document title={`Proposta — ${title}`} author={profName}>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{profName}</Text>
            <Text style={styles.brandSub}>{location || "Brasil"}</Text>
            {crea && <Text style={styles.brandSub}>{crea}</Text>}
          </View>
          <View>
            <Text style={styles.docTitle}>PROPOSTA COMERCIAL</Text>
            <Text style={styles.docDate}>{dateStr}</Text>
            {validity && <Text style={styles.docValidade}>Válida até: {validity}</Text>}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Partes */}
        <View style={{ flexDirection: "row", gap: 20, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Profissional</Text>
            <View style={styles.row}><Text style={styles.label}>Nome</Text><Text style={styles.value}>{profName}</Text></View>
            {prof?.email && <View style={styles.row}><Text style={styles.label}>E-mail</Text><Text style={styles.value}>{prof.email}</Text></View>}
            {prof?.phone && <View style={styles.row}><Text style={styles.label}>Telefone</Text><Text style={styles.value}>{prof.phone}</Text></View>}
            {crea && <View style={styles.row}><Text style={styles.label}>Registro</Text><Text style={styles.value}>{crea}</Text></View>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <View style={styles.row}><Text style={styles.label}>Nome</Text><Text style={styles.value}>{conv.visitor_name}</Text></View>
            <View style={styles.row}><Text style={styles.label}>E-mail</Text><Text style={styles.value}>{conv.visitor_email}</Text></View>
            {conv.visitor_phone && <View style={styles.row}><Text style={styles.label}>Telefone</Text><Text style={styles.value}>{conv.visitor_phone}</Text></View>}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Título */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projeto</Text>
          <Text style={{ fontSize: 14, fontWeight: "bold", color: "#111", marginBottom: 12 }}>{title}</Text>

          <Text style={styles.sectionTitle}>Escopo / Descrição</Text>
          <View style={styles.scopeBox}>
            <Text style={styles.scopeText}>{scope}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Valor e prazo */}
        <View style={{ flexDirection: "row", gap: 16, marginBottom: 20 }}>
          {value && (
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Valor total</Text>
              <View style={styles.valueBox}>
                <Text style={styles.valueLabel}>Investimento</Text>
                <Text style={styles.valueAmount}>R$ {value}</Text>
              </View>
            </View>
          )}
          {(deadline || payment) && (
            <View style={{ flex: 1 }}>
              {deadline && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.sectionTitle}>Prazo de entrega</Text>
                  <View style={[styles.scopeBox, { padding: 10 }]}>
                    <Text style={{ fontSize: 10, color: "#374151" }}>{deadline}</Text>
                  </View>
                </View>
              )}
              {payment && (
                <View>
                  <Text style={styles.sectionTitle}>Condições de pagamento</Text>
                  <View style={[styles.scopeBox, { padding: 10 }]}>
                    <Text style={{ fontSize: 10, color: "#374151" }}>{payment}</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Assinaturas */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}><Text> </Text></View>
            <Text style={styles.signatureLabel}>Profissional</Text>
            <Text style={styles.signatureName}>{profName}</Text>
            {crea && <Text style={[styles.signatureLabel, { marginTop: 2 }]}>{crea}</Text>}
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}><Text> </Text></View>
            <Text style={styles.signatureLabel}>Cliente</Text>
            <Text style={styles.signatureName}>{conv.visitor_name}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Gerado via EngHub · {dateStr}</Text>
          <Text style={styles.footerText}>enghub.com.br</Text>
        </View>

      </Page>
    </Document>
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="proposta-${title.slice(0, 30).replace(/\s+/g, "-").toLowerCase()}.pdf"`,
    },
  });
}
