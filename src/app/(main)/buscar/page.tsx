import { createClient } from "@/lib/supabase/server";
import { BuscarClient } from "./buscar-client";

export default async function BuscarPage() {
  const supabase = await createClient();

  const { data: tenants } = await supabase
    .from("tenants")
    .select(`
      id,
      name,
      slug,
      professional_profiles (
        bio,
        areas,
        city,
        state,
        years_experience
      )
    `)
    .eq("status", "ACTIVE")
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
        bio: prof?.bio ?? null,
        areas: (prof?.areas ?? []) as string[],
        city: prof?.city ?? null,
        state: prof?.state ?? null,
        years_experience: prof?.years_experience ?? null,
        avgRating: rating ? rating.sum / rating.count : 0,
        reviewCount: rating?.count ?? 0,
      };
    });

  return <BuscarClient professionals={professionals} />;
}
