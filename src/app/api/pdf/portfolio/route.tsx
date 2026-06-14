import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a" },
  cover: { flex: 1, justifyContent: "center", alignItems: "center" },
  coverBrand: { fontSize: 28, fontWeight: "bold", color: "#111", marginBottom: 8 },
  coverName: { fontSize: 20, color: "#444", marginBottom: 4 },
  coverTitle: { fontSize: 12, color: "#888", marginBottom: 24 },
  divider: { borderBottomWidth: 0.5, borderBottomColor: "#e5e5e5", marginVertical: 16 },
  sectionTitle: { fontSize: 9, fontWeight: "bold", color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  projectCard: { marginBottom: 24, padding: 14, backgroundColor: "#f9f9f9", borderRadius: 6 },
  projectImage: { width: "100%", height: 140, objectFit: "cover", borderRadius: 4, marginBottom: 10 },
  projectTitle: { fontSize: 13, fontWeight: "bold", marginBottom: 4, color: "#111" },
  badgeRow: { flexDirection: "row", gap: 6, marginBottom: 6 },
  badge: { fontSize: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, backgroundColor: "#e5e7eb", color: "#374151" },
  badgeSuccess: { backgroundColor: "#dcfce7", color: "#166534" },
  projectDesc: { fontSize: 10, color: "#555", lineHeight: 1.5, marginTop: 4 },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 80, color: "#888" },
  value: { flex: 1, color: "#333" },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: "#ccc" },
});

const areaLabels: Record<string, string> = {
  CIVIL: "Engenharia Civil",
  ELECTRICAL: "Engenharia Elétrica",
  MECHANICAL: "Engenharia Mecânica",
  ARCHITECTURE: "Arquitetura",
  ENVIRONMENTAL: "Engenharia Ambiental",
  PRODUCTION: "Engenharia de Produção",
  CHEMICAL: "Engenharia Química",
  HYDRAULIC: "Engenharia Hidráulica",
  TOPOGRAPHY: "Topografia",
  AGRONOMY: "Agronomia",
};

export async function GET() {
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

  const { data: profile } = await admin
    .from("professional_profiles")
    .select("name, title, bio, email, phone, city, state, crea_cau_number, crea_cau_type, crea_cau_verified")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  const { data: projects } = await admin
    .from("projects")
    .select("id, title, area, status, location, description, image_url, created_at")
    .eq("tenant_id", tenant.id)
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false });

  const { data: services } = await admin
    .from("services")
    .select("title, description, price")
    .eq("tenant_id", tenant.id)
    .limit(10);

  const profileName = profile?.name ?? "Profissional";
  const generatedAt = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  const doc = (
    <Document title={`Portfólio — ${profileName}`} author="EngHub">
      {/* Capa */}
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.coverBrand}>EngHub</Text>
          <Text style={styles.coverName}>{profileName}</Text>
          {profile?.title ? <Text style={styles.coverTitle}>{profile.title}</Text> : null}
          {profile?.city ? (
            <Text style={{ fontSize: 10, color: "#aaa", marginBottom: 4 }}>
              {profile.city}{profile.state ? `, ${profile.state}` : ""}
            </Text>
          ) : null}
          {profile?.email ? <Text style={{ fontSize: 9, color: "#aaa", marginBottom: 2 }}>{profile.email}</Text> : null}
          {profile?.phone ? <Text style={{ fontSize: 9, color: "#aaa" }}>{profile.phone}</Text> : null}
          {profile?.crea_cau_verified ? (
            <Text style={{ fontSize: 9, color: "#166534", backgroundColor: "#dcfce7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 16 }}>
              {profile.crea_cau_type ?? "CREA"} Verificado · {profile.crea_cau_number}
            </Text>
          ) : null}
          <Text style={{ fontSize: 8, color: "#bbb", marginTop: 32 }}>Gerado em {generatedAt} via EngHub</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>EngHub — enghub.com.br</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {/* Bio + Serviços */}
      {profile?.bio ? (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <View style={styles.divider} />
          <Text style={{ fontSize: 11, color: "#444", lineHeight: 1.7 }}>{profile.bio}</Text>

          {(services ?? []).length > 0 ? (
            <View style={{ marginTop: 28 }}>
              <Text style={styles.sectionTitle}>Serviços</Text>
              <View style={styles.divider} />
              {(services ?? []).map((s, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <View style={styles.row}>
                    <Text style={styles.label}>{s.title}</Text>
                    <Text style={styles.value}>
                      {s.price ? `R$ ${Number(s.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Sob consulta"}
                    </Text>
                  </View>
                  {s.description ? <Text style={{ fontSize: 9, color: "#888", marginLeft: 80 }}>{s.description}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>EngHub — enghub.com.br</Text>
            <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      ) : null}

      {/* Projetos */}
      {(projects ?? []).length > 0 ? (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Projetos ({(projects ?? []).length} publicados)</Text>
          <View style={styles.divider} />

          {(projects ?? []).map((p, i) => (
            <View key={i} style={styles.projectCard} wrap={false}>
              {p.image_url ? <Image src={p.image_url} style={styles.projectImage} /> : null}
              <Text style={styles.projectTitle}>{p.title}</Text>
              <View style={styles.badgeRow}>
                <Text style={styles.badge}>{areaLabels[p.area] ?? p.area}</Text>
                <Text style={[styles.badge, styles.badgeSuccess]}>Publicado</Text>
                {p.location ? <Text style={styles.badge}>{p.location}</Text> : null}
              </View>
              {p.description ? <Text style={styles.projectDesc}>{p.description}</Text> : null}
              <Text style={{ fontSize: 8, color: "#bbb", marginTop: 6 }}>
                {new Date(p.created_at).toLocaleDateString("pt-BR")}
              </Text>
            </View>
          ))}

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>EngHub — enghub.com.br</Text>
            <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      ) : null}
    </Document>
  );

  const buffer = await renderToBuffer(doc);
  const filename = `portfolio-${(profile?.name ?? "engenheiro").replace(/\s+/g, "-").toLowerCase()}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
