import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { engineeringAreaLabels } from "@/lib/utils";
import { areaSlugToKey, brazilianStates } from "@/lib/seo-locations";
import { Users, MapPin, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Engenheiros e Arquitetos no Brasil | EngHub",
  description:
    "Encontre engenheiros civis, elétricos, mecânicos, arquitetos e muito mais em todo o Brasil. Perfis verificados com portfólio real no EngHub.",
  alternates: { canonical: "/engenheiros" },
};

export const revalidate = 3600; // 1h ISR

export default async function EngenheirosHubPage() {
  const supabase = await createClient();

  // Count professionals per area
  const { data: areaCounts } = await supabase
    .from("professional_profiles")
    .select("areas, tenants!inner(status)")
    .eq("tenants.status", "ACTIVE");

  const counts: Record<string, number> = {};
  for (const row of areaCounts ?? []) {
    for (const area of row.areas ?? []) {
      counts[area as string] = (counts[area as string] ?? 0) + 1;
    }
  }

  const areas = Object.entries(areaSlugToKey).map(([slug, key]) => ({
    slug,
    key,
    label: engineeringAreaLabels[key] ?? key,
    count: counts[key] ?? 0,
  })).sort((a, b) => b.count - a.count);

  // Top states
  const { data: stateCounts } = await supabase
    .from("professional_profiles")
    .select("state, tenants!inner(status)")
    .eq("tenants.status", "ACTIVE")
    .not("state", "is", null);

  const stateTotals: Record<string, number> = {};
  for (const row of stateCounts ?? []) {
    if (row.state) stateTotals[row.state] = (stateTotals[row.state] ?? 0) + 1;
  }

  const topStates = brazilianStates
    .map((s) => ({ ...s, count: stateTotals[s.uf] ?? 0 }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const totalProfessionals = Object.values(stateTotals).reduce((s, v) => s + v, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-zinc-800 dark:text-zinc-300">
          <Users size={12} /> {totalProfessionals}+ profissionais cadastrados
        </p>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-zinc-100">
          Engenheiros e Arquitetos<br className="hidden sm:block" /> no Brasil
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-500 dark:text-zinc-400">
          Encontre profissionais por especialidade ou estado. Portfólios reais, avaliações verificadas.
        </p>
      </div>

      {/* Areas grid */}
      <section>
        <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-zinc-100">Por especialidade</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <Link
              key={area.slug}
              href={`/engenheiros/${area.slug}`}
              className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-gray-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
                  {area.label}
                </p>
                {area.count > 0 && (
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-zinc-500">
                    {area.count} profissional{area.count !== 1 ? "is" : ""}
                  </p>
                )}
              </div>
              <ChevronRight size={16} className="text-gray-300 transition-transform group-hover:translate-x-0.5 dark:text-zinc-600" />
            </Link>
          ))}
        </div>
      </section>

      {/* Top states */}
      {topStates.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-zinc-100">Por estado</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {topStates.map((state) => (
              <Link
                key={state.slug}
                href={`/buscar?area=&q=${encodeURIComponent(state.uf)}`}
                className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:border-gray-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <MapPin size={14} className="shrink-0 text-gray-400 dark:text-zinc-500" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-zinc-200">{state.name}</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500">{state.count} profissionais</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="mt-16 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 px-8 py-10 text-center text-white">
        <h2 className="text-2xl font-bold">É engenheiro ou arquiteto?</h2>
        <p className="mt-2 text-zinc-400">Crie seu perfil gratuito e apareça para clientes em todo o Brasil.</p>
        <Link
          href="/cadastro"
          className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-100"
        >
          Criar perfil grátis
        </Link>
      </div>
    </div>
  );
}
