import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const alt = "EngHub — Plataforma para Engenheiros";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const supabase = await createClient();

  const [
    { count: totalProfessionals },
    { count: totalProjects },
  ] = await Promise.all([
    supabase.from("tenants").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "PUBLISHED"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: "sans-serif",
          background: "linear-gradient(145deg, #09090b 0%, #18181b 50%, #1c1c1e 100%)",
          color: "white",
          padding: "60px 80px",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "#374151",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            E
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#a1a1aa" }}>
            EngHub
          </span>
        </div>

        {/* Main text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <span
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: "80%",
            }}
          >
            Encontre o profissional certo para sua obra
          </span>
          <span style={{ fontSize: 24, color: "#a1a1aa", maxWidth: "70%" }}>
            Portfólios verificados, avaliações reais e contato direto com engenheiros de todo o Brasil.
          </span>
        </div>

        {/* Bottom stats */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: 28, fontWeight: 800 }}>
              {totalProfessionals ?? 0}
            </span>
            <span style={{ fontSize: 18, color: "#71717a" }}>profissionais</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: 28, fontWeight: 800 }}>
              {totalProjects ?? 0}
            </span>
            <span style={{ fontSize: 18, color: "#71717a" }}>projetos</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 18, color: "#71717a" }}>enghub.com.br</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
