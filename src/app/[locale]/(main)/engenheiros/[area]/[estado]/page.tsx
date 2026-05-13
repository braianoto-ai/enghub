import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { engineeringAreaLabels } from "@/lib/utils";
import { areaSlugToKey, stateSlugToUF, stateSlugToName, brazilianStates, areaKeyToSlug } from "@/lib/seo-locations";
import { MapPin, Star, ShieldCheck, ChevronRight } from "lucide-react";

export const revalidate = 3600;

type ProfItem = { id: string; name: string; slug: string; bio: string | null; city: string | null; state: string | null; years_experience: number | null; avatar_url: string | null; verified: boolean; avgRating: number; reviewCount: number };

interface Props { params: Promise<{ area: string; estado: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area, estado } = await params;
  const key  = areaSlugToKey[area];
  const uf   = stateSlugToUF[estado];
  if (!key || !uf) return { title: "Não encontrado" };

  const label     = engineeringAreaLabels[key] ?? key;
  const stateName = stateSlugToName[estado] ?? uf;
  const title       = `${label} em ${stateName} | EngHub`;
  const description = `Encontre profissionais de ${label} em ${stateName}. Portfólios verificados, avaliações reais e contato direto. Solicite orçamentos no EngHub.`;

  return {
    title,
    description,
    alternates: { canonical: `/engenheiros/${area}/${estado}` },
    openGraph: { title, description, url: `/engenheiros/${area}/${estado}` },
  };
}

export async function generateStaticParams() {
  // Generate only for the most common combinations at build time
  const topAreas  = ["civil", "eletrica", "mecanica", "arquitetura", "ambiental"];
  const topStates = ["sp", "rj", "mg", "rs", "pr", "sc", "ba", "ce", "go", "pe"];
  return topAreas.flatMap((area) => topStates.map((estado) => ({ area, estado })));
}

export default async function AreaEstadoPage({ params }: Props) {
  const { area, estado } = await params;
  const key       = areaSlugToKey[area];
  const uf        = stateSlugToUF[estado];
  const stateName = stateSlugToName[estado];
  if (!key || !uf) notFound();

  const label     = engineeringAreaLabels[key] ?? key;
  const supabase  = await createClient();

  const { data: tenants } = await supabase
    .from("tenants")
    .select(`
      id, name, slug, featured,
      professional_profiles (
        bio, city, state, years_experience, avatar_url,
        crea_cau_verified, areas
      )
    `)
    .eq("status", "ACTIVE")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  // Filter client-side for area + state (Supabase array contains + text filter)
  const { data: reviews } = await supabase
    .from("reviews")
    .select("tenant_id, rating");

  const ratingMap = (reviews ?? []).reduce<Record<string, { sum: number; count: number }>>((acc, r) => {
    if (!acc[r.tenant_id]) acc[r.tenant_id] = { sum: 0, count: 0 };
    acc[r.tenant_id].sum += r.rating;
    acc[r.tenant_id].count += 1;
    return acc;
  }, {});

  const professionals: ProfItem[] = (tenants ?? [])
    .map((t): ProfItem | null => {
      const prof = Array.isArray(t.professional_profiles) ? t.professional_profiles[0] : t.professional_profiles;
      if (!prof) return null;
      if (!((prof.areas as string[]) ?? []).includes(key)) return null;
      if (prof.state?.toUpperCase() !== uf) return null;
      const r = ratingMap[t.id];
      return {
        id: t.id, name: t.name, slug: t.slug,
        bio: prof.bio ?? null, city: prof.city ?? null, state: prof.state ?? null,
        years_experience: prof.years_experience ?? null,
        avatar_url: prof.avatar_url ?? null,
        verified: prof.crea_cau_verified === true,
        avgRating: r ? r.sum / r.count : 0,
        reviewCount: r?.count ?? 0,
      };
    })
    .filter((x): x is ProfItem => x !== null);

  // Other states with this area
  const otherStates = brazilianStates
    .filter((s) => s.uf !== uf)
    .filter((s) => (tenants ?? []).some((t) => {
      const prof = Array.isArray(t.professional_profiles) ? t.professional_profiles[0] : t.professional_profiles;
      return prof && (prof.areas as string[] ?? []).includes(key) && prof.state?.toUpperCase() === s.uf;
    }))
    .slice(0, 8);

  // Related areas in this state
  const relatedAreaKeys = new Set<string>();
  for (const t of tenants ?? []) {
    const prof = Array.isArray(t.professional_profiles) ? t.professional_profiles[0] : t.professional_profiles;
    if (!prof || prof.state?.toUpperCase() !== uf) continue;
    for (const a of (prof.areas as string[] ?? [])) {
      if (a !== key && areaKeyToSlug[a]) relatedAreaKeys.add(a);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500">
        <Link href="/" className="hover:text-gray-700 dark:hover:text-zinc-200">Home</Link>
        <ChevronRight size={12} />
        <Link href="/engenheiros" className="hover:text-gray-700 dark:hover:text-zinc-200">Engenheiros</Link>
        <ChevronRight size={12} />
        <Link href={`/engenheiros/${area}`} className="hover:text-gray-700 dark:hover:text-zinc-200">{label}</Link>
        <ChevronRight size={12} />
        <span className="text-gray-600 dark:text-zinc-300">{stateName}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-100">
          {label} em {stateName}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-zinc-400">
          {professionals.length > 0
            ? `${professionals.length} profissional${professionals.length !== 1 ? "is" : ""} de ${label} em ${stateName} no EngHub.`
            : `Busque profissionais de ${label} em ${stateName} no EngHub.`
          }
        </p>
      </div>

      {/* Grid */}
      {professionals.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-400 dark:text-zinc-500">Nenhum profissional cadastrado nesta área e estado ainda.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href={`/engenheiros/${area}`} className="text-sm font-medium text-gray-600 hover:underline dark:text-zinc-400">
              Ver todos de {label} no Brasil →
            </Link>
            <Link href="/buscar" className="text-sm font-medium text-gray-600 hover:underline dark:text-zinc-400">
              Buscar profissionais →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((p) => (
            <ProfessionalCard key={p.id} professional={p} />
          ))}
        </div>
      )}

      {/* Other states */}
      {otherStates.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-base font-semibold text-gray-700 dark:text-zinc-300">
            {label} em outros estados
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherStates.map((s) => (
              <Link
                key={s.slug}
                href={`/engenheiros/${area}/${s.slug}`}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:border-gray-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-500"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related areas */}
      {relatedAreaKeys.size > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-base font-semibold text-gray-700 dark:text-zinc-300">
            Outras especialidades em {stateName}
          </h2>
          <div className="flex flex-wrap gap-2">
            {Array.from(relatedAreaKeys).slice(0, 6).map((aKey) => {
              const aSlug = areaKeyToSlug[aKey];
              return (
                <Link
                  key={aKey}
                  href={`/engenheiros/${aSlug}/${estado}`}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:border-gray-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                >
                  {engineeringAreaLabels[aKey] ?? aKey}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* SEO text */}
      <section className="mt-12 rounded-2xl border border-gray-100 bg-gray-50 px-8 py-7 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-zinc-100">
          Contratar {label} em {stateName}
        </h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-zinc-400">
          O EngHub facilita a contratação de profissionais de {label} em {stateName}. Compare
          portfólios, leia avaliações de clientes reais e solicite orçamentos diretamente.
          Todos os profissionais têm registro CREA ou CAU verificado. Encontre o especialista
          certo para seu projeto em {stateName} de forma rápida e segura.
        </p>
      </section>

      {/* CTA */}
      <div className="mt-10 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 px-8 py-8 text-center text-white">
        <h2 className="text-xl font-bold">É {label.toLowerCase()} em {stateName}?</h2>
        <p className="mt-1 text-sm text-zinc-400">Crie seu perfil e apareça para clientes na sua região.</p>
        <Link href="/cadastro" className="mt-4 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 hover:bg-zinc-100">
          Criar perfil grátis
        </Link>
      </div>
    </div>
  );
}

function ProfessionalCard({ professional: p }: { professional: ProfItem }) {
  const initials = p.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <Link
      href={`/${p.slug}`}
      className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start gap-3">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 text-sm font-bold text-white">
          {p.avatar_url ? <Image src={p.avatar_url} alt={p.name} fill className="object-cover" /> : initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-semibold text-gray-900 group-hover:text-gray-700 dark:text-zinc-100">{p.name}</p>
            {p.verified && <ShieldCheck size={13} className="shrink-0 text-green-500" />}
          </div>
          {p.city && (
            <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-zinc-500">
              <MapPin size={10} />{p.city}
            </p>
          )}
        </div>
      </div>
      {p.bio && <p className="mt-3 line-clamp-2 text-sm text-gray-500 dark:text-zinc-400">{p.bio}</p>}
      <div className="mt-3 flex items-center justify-between">
        {p.avgRating > 0 ? (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-zinc-400">
            <Star size={11} className="fill-yellow-400 text-yellow-400" />
            {p.avgRating.toFixed(1)} ({p.reviewCount})
          </span>
        ) : <span />}
        {p.years_experience && (
          <span className="text-xs text-gray-400 dark:text-zinc-500">{p.years_experience} anos exp.</span>
        )}
      </div>
    </Link>
  );
}
