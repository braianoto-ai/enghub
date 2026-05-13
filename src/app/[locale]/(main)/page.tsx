import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "./hero-search";
import {
  ArrowRight,
  Shield,
  Star,
  Users,
  CheckCircle,
  Building2,
  Zap,
  Leaf,
  FlaskConical,
  HardHat,
  Cpu,
} from "lucide-react";

const AREA_KEYS = ["CIVIL", "MECANICA", "ELETRICA", "ARQUITETURA", "AMBIENTAL", "QUIMICA", "PRODUCAO"] as const;
type AreaKey = (typeof AREA_KEYS)[number];

const AREA_ICONS: Record<AreaKey, { icon: React.ElementType; iconColor: string }> = {
  CIVIL:       { icon: Building2,    iconColor: "text-gray-400" },
  MECANICA:    { icon: HardHat,      iconColor: "text-gray-500" },
  ELETRICA:    { icon: Zap,          iconColor: "text-gray-300" },
  ARQUITETURA: { icon: Building2,    iconColor: "text-gray-400" },
  AMBIENTAL:   { icon: Leaf,         iconColor: "text-gray-500" },
  QUIMICA:     { icon: FlaskConical, iconColor: "text-gray-300" },
  PRODUCAO:    { icon: Cpu,          iconColor: "text-gray-400" },
};

export default async function HomePage() {
  const supabase = await createClient();
  const t = await getTranslations("home");

  const [
    { count: totalProfessionals },
    { count: totalReviews },
    { count: totalProjects },
    { data: topProfessionals },
    { data: areaCounts },
  ] = await Promise.all([
    supabase.from("tenants").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "PUBLISHED"),
    supabase
      .from("tenants")
      .select("id, name, slug, featured, professional_profiles(areas, city, state, bio), reviews(rating)")
      .eq("status", "ACTIVE")
      .eq("featured", true)
      .limit(6),
    supabase
      .from("professional_profiles")
      .select("areas"),
  ]);

  // Compute featured professionals with ratings
  const professionalsWithRating = (topProfessionals ?? [])
    .map((ten) => {
      const reviews = (ten.reviews as { rating: number }[]) ?? [];
      const avg = reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;
      const prof = Array.isArray(ten.professional_profiles)
        ? ten.professional_profiles[0]
        : ten.professional_profiles;
      return { ...ten, prof, avg, reviewCount: reviews.length };
    })
    .filter((ten) => ten.prof)
    .slice(0, 3);

  // Count professionals per area
  const areaCountMap: Record<string, number> = {};
  (areaCounts ?? []).forEach((p) => {
    const areas = (p.areas as string[]) ?? [];
    areas.forEach((a) => { areaCountMap[a] = (areaCountMap[a] ?? 0) + 1; });
  });

  const displayAreas = AREA_KEYS.map((key) => ({
    key,
    label: t(`area_${key.toLowerCase()}` as Parameters<typeof t>[0]),
    ...AREA_ICONS[key],
    count: areaCountMap[key] ?? 0,
  }));

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "enghub.com.br";
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "EngHub",
    url: `https://${rootDomain}`,
    description: "Plataforma para encontrar engenheiros e arquitetos com portfólios verificados e avaliações reais.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://${rootDomain}/buscar?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "pt-BR",
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "EngHub",
    url: `https://${rootDomain}`,
    logo: `https://${rootDomain}/icon-512.png`,
    description: "Marketplace de engenheiros e arquitetos do Brasil com portfólios verificados.",
    foundingLocation: { "@type": "Place", addressCountry: "BR" },
    ...(totalProfessionals ? { numberOfEmployees: { "@type": "QuantitativeValue", value: totalProfessionals } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
    <div className="overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 px-4 pb-32 pt-20 text-white">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-gray-800/15 blur-3xl" />
          <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-gray-1000/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -tranzinc-x-1/2 rounded-full bg-gray-700/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-400/20 bg-gray-1000/10 px-4 py-1.5 text-sm text-gray-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t("hero_active_count", { count: totalProfessionals ?? 0 })}
          </div>

          <h1 className="mt-4 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            {t("hero_title")}
            <span className="block bg-gradient-to-r from-gray-400 to-gray-200 bg-clip-text text-transparent">
              {t("hero_title_highlight")}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-300">
            {t("hero_subtitle")}
          </p>

          <div className="mt-10">
            <HeroSearch />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400" />{t("hero_trust_free")}</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400" />{t("hero_trust_no_middle")}</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400" />{t("hero_trust_verified")}</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative mx-auto mt-20 max-w-3xl">
          <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            {[
              { value: totalProfessionals ?? 0, label: t("stats_professionals") },
              { value: totalReviews ?? 0, label: t("stats_reviews") },
              { value: totalProjects ?? 0, label: t("stats_projects") },
            ].map((stat) => (
              <div key={stat.label} className="px-6 py-5 text-center">
                <p className="text-3xl font-bold text-white">{stat.value.toLocaleString("pt-BR")}</p>
                <p className="mt-1 text-sm text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AREAS ────────────────────────────────────────── */}
      <section className="px-4 py-24 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 sm:text-4xl">
              {t("areas_title")}
            </h2>
            <p className="mt-3 text-gray-500 dark:text-zinc-400">
              {t("areas_subtitle")}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {displayAreas.map((area) => (
              <Link
                key={area.key}
                href={`/buscar?area=${area.key}`}
                className="group relative"
              >
                {/* gradient border wrapper */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-500 via-gray-400 to-gray-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-zinc-900" />

                {/* card content */}
                <div className="relative rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 group-hover:border-transparent group-hover:-tranzinc-y-1 group-hover:shadow-xl dark:border-zinc-700/60 dark:bg-zinc-900">
                  <area.icon
                    size={32}
                    strokeWidth={1.5}
                    className={`mb-4 ${area.iconColor} transition-transform duration-300 group-hover:scale-110`}
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-zinc-100">{area.label}</h3>
                  <p className="mt-1 text-sm text-gray-400 dark:text-zinc-500">
                    {t(area.count !== 1 ? "areas_count_other" : "areas_count_one", { count: area.count })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP PROFESSIONALS ────────────────────────────── */}
      {professionalsWithRating.length > 0 && (
        <section className="bg-gray-50 px-4 py-24 dark:bg-zinc-900">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 sm:text-4xl">
                  {t("featured_title")}
                </h2>
                <p className="mt-2 text-gray-500 dark:text-zinc-400">
                  {t("featured_subtitle")}
                </p>
              </div>
              <Link href="/buscar" className="hidden text-sm font-medium text-gray-600 hover:underline dark:text-gray-400 sm:block">
                {t("featured_see_all")}
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {professionalsWithRating.map((p) => {
                const initials = p.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
                const areas = (p.prof?.areas as string[]) ?? [];
                return (
                  <Link
                    key={p.id}
                    href={`/${p.slug}`}
                    className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-tranzinc-y-1 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-700 text-lg font-bold text-white shadow">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900 group-hover:text-gray-600 dark:text-zinc-100 dark:group-hover:text-gray-400">
                          {p.name}
                        </p>
                        {(p.prof?.city || p.prof?.state) && (
                          <p className="truncate text-xs text-gray-400 dark:text-zinc-500">
                            {[p.prof.city, p.prof.state].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>

                    {p.prof?.bio && (
                      <p className="mt-3 line-clamp-2 text-sm text-gray-500 dark:text-zinc-400">{p.prof.bio}</p>
                    )}

                    {areas.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {areas.slice(0, 2).map((a: string) => (
                          <span key={a} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800/30 dark:text-gray-400">
                            {a}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-zinc-700">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                          {p.avg > 0 ? p.avg.toFixed(1) : "—"}
                        </span>
                        {p.reviewCount > 0 && (
                          <span className="text-xs text-gray-400 dark:text-zinc-500">({p.reviewCount})</span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t("featured_view_profile")}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="px-4 py-24 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 sm:text-4xl">
              {t("how_title")}
            </h2>
            <p className="mt-3 text-gray-500 dark:text-zinc-400">{t("how_subtitle")}</p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* For clients */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-800/30 dark:text-gray-400">
                <Users size={14} />
                {t("how_clients_badge")}
              </div>
              <div className="space-y-6">
                {([
                  { step: "1", title: t("how_client_step1_title"), desc: t("how_client_step1_desc") },
                  { step: "2", title: t("how_client_step2_title"), desc: t("how_client_step2_desc") },
                  { step: "3", title: t("how_client_step3_title"), desc: t("how_client_step3_desc") },
                ]).map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-700 text-sm font-bold text-white">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-zinc-100">{item.title}</p>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/buscar" className="mt-8 block">
                <Button className="w-full bg-gray-700 hover:bg-gray-600">
                  {t("how_cta_clients")}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>

            {/* For engineers */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-800/30 dark:text-gray-400">
                <HardHat size={14} />
                {t("how_engineers_badge")}
              </div>
              <div className="space-y-6">
                {([
                  { step: "1", title: t("how_engineer_step1_title"), desc: t("how_engineer_step1_desc") },
                  { step: "2", title: t("how_engineer_step2_title"), desc: t("how_engineer_step2_desc") },
                  { step: "3", title: t("how_engineer_step3_title"), desc: t("how_engineer_step3_desc") },
                ]).map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-white">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-zinc-100">{item.title}</p>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/cadastro" className="mt-8 block">
                <Button variant="secondary" className="w-full">
                  {t("how_cta_engineers")}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY ENGHUB ───────────────────────────────────── */}
      <section className="bg-gray-50 px-4 py-24 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-zinc-100 sm:text-4xl">
            {t("why_title")}
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {([
              {
                icon: Shield,
                color: "bg-gray-200 text-gray-600 dark:bg-gray-700/40 dark:text-gray-400",
                title: t("why_feat1_title"),
                desc: t("why_feat1_desc"),
              },
              {
                icon: Star,
                color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400",
                title: t("why_feat2_title"),
                desc: t("why_feat2_desc"),
              },
              {
                icon: Users,
                color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
                title: t("why_feat3_title"),
                desc: t("why_feat3_desc"),
              },
            ]).map((f) => (
              <div key={f.title} className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800/20">
                  <f.icon size={26} className="text-gray-700 dark:text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-900 px-4 py-24 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gray-1000/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gray-700/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold">{t("cta_title")}</h2>
          <p className="mt-4 text-lg text-zinc-400">
            {t("cta_subtitle")}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/cadastro">
              <Button size="lg" className="bg-gray-700 text-white hover:bg-gray-600">
                {t("cta_button")}
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="/buscar">
              <Button size="lg" variant="ghost" className="!text-zinc-300 hover:!bg-white/5">
                {t("cta_search")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
