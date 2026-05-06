import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BuscarClient } from "./buscar-client";

export const metadata: Metadata = {
  title: "Buscar Engenheiros",
  description:
    "Encontre engenheiros por especialidade, cidade ou nome. Portfólios verificados e avaliações reais no EngHub.",
  alternates: { canonical: "/buscar" },
  openGraph: {
    title: "Buscar Engenheiros | EngHub",
    description: "Encontre o profissional de engenharia certo para seu projeto.",
    url: "/buscar",
  },
};

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string }>;
}) {
  const { q, area } = await searchParams;
  const supabase = await createClient();

  const { data: tenants } = await supabase
    .from("tenants")
    .select(`
      id,
      name,
      slug,
      featured,
      professional_profiles (
        bio,
        areas,
        city,
        state,
        years_experience,
        avatar_url
      )
    `)
    .eq("status", "ACTIVE")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  // Busca média de avaliações para cada tenant
  const { data: reviews } = await supabase
    .from("reviews")
    .select("tenant_id, rating");

  const ratingMap = (reviews ?? []).reduce<Record<string, { sum: number; count: number }>>(
    (acc, r) => {
      if (!acc[r.tenant_id]) acc[r.tenant_id] = { sum: 0, count: 0 };
      acc[r.tenant_id].sum += r.rating;
      acc[r.tenant_id].count += 1;
      return acc;
    },
    {}
  );

  const professionals = (tenants ?? [])
    .filter((t) => {
      const prof = Array.isArray(t.professional_profiles)
        ? t.professional_profiles[0]
        : t.professional_profiles;
      return prof !== null;
    })
    .map((t) => {
      const prof = Array.isArray(t.professional_profiles)
        ? t.professional_profiles[0]
        : t.professional_profiles;
      const rating = ratingMap[t.id];
      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        featured: t.featured ?? false,
        bio: prof?.bio ?? null,
        areas: (prof?.areas ?? []) as string[],
        city: prof?.city ?? null,
        state: prof?.state ?? null,
        years_experience: prof?.years_experience ?? null,
        avgRating: rating ? rating.sum / rating.count : 0,
        reviewCount: rating?.count ?? 0,
        avatar_url: prof?.avatar_url ?? null,
      };
    });

  return <BuscarClient professionals={professionals} initialSearch={q ?? ""} initialArea={area ?? ""} />;
}
