import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { engineeringAreaLabels } from "@/lib/utils";

export const alt = "Perfil profissional no EngHub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", slug)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (!tenant) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #18181b, #27272a)",
            color: "white",
            fontSize: 48,
            fontFamily: "sans-serif",
          }}
        >
          EngHub
        </div>
      ),
      { ...size }
    );
  }

  const [{ data: prof }, { data: reviews }] = await Promise.all([
    supabase
      .from("professional_profiles")
      .select("areas, city, state, avatar_url, years_experience")
      .eq("tenant_id", tenant.id)
      .maybeSingle(),
    supabase
      .from("reviews")
      .select("rating")
      .eq("tenant_id", tenant.id),
  ]);

  const primaryArea = prof?.areas?.[0]
    ? engineeringAreaLabels[prof.areas[0]] ?? prof.areas[0]
    : null;
  const location = [prof?.city, prof?.state].filter(Boolean).join(", ");
  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;
  const initials = tenant.name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

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
        }}
      >
        {/* Top bar with logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              E
            </div>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#a1a1aa" }}>
              EngHub
            </span>
          </div>
          {avgRating && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.08)",
                borderRadius: 999,
                padding: "8px 20px",
              }}
            >
              <span style={{ fontSize: 22, color: "#facc15" }}>★</span>
              <span style={{ fontSize: 22, fontWeight: 700 }}>{avgRating}</span>
              <span style={{ fontSize: 16, color: "#a1a1aa" }}>
                ({reviews?.length ?? 0} {reviews?.length === 1 ? "avaliação" : "avaliações"})
              </span>
            </div>
          )}
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "40px",
            flex: 1,
            marginTop: 20,
          }}
        >
          {/* Avatar */}
          {prof?.avatar_url ? (
            <img
              src={prof.avatar_url}
              width={160}
              height={160}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid rgba(255,255,255,0.1)",
              }}
            />
          ) : (
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6b7280, #374151)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 64,
                fontWeight: 800,
                border: "4px solid rgba(255,255,255,0.1)",
              }}
            >
              {initials}
            </div>
          )}

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
            <span
              style={{
                fontSize: 52,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {tenant.name}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              {primaryArea && (
                <span
                  style={{
                    fontSize: 20,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 999,
                    padding: "6px 18px",
                    color: "#d4d4d8",
                  }}
                >
                  {primaryArea}
                </span>
              )}
              {location && (
                <span style={{ fontSize: 20, color: "#a1a1aa", display: "flex", alignItems: "center", gap: "6px" }}>
                  📍 {location}
                </span>
              )}
              {prof?.years_experience && (
                <span style={{ fontSize: 20, color: "#a1a1aa" }}>
                  {prof.years_experience}+ anos de experiência
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 24,
          }}
        >
          <span style={{ fontSize: 18, color: "#71717a" }}>
            enghub.com.br/{slug}
          </span>
          <span
            style={{
              fontSize: 16,
              color: "#374151",
              background: "white",
              borderRadius: 10,
              padding: "10px 24px",
              fontWeight: 700,
            }}
          >
            Ver perfil completo →
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
