import { createClient } from "@/lib/supabase/server";
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

const AREA_CONFIG: Record<string, { label: string; icon: React.ElementType; iconColor: string }> = {
  CIVIL:      { label: "Eng. Civil",       icon: Building2,    iconColor: "text-violet-400" },
  MECANICA:   { label: "Eng. Mecânica",    icon: HardHat,      iconColor: "text-violet-500" },
  ELETRICA:   { label: "Eng. Elétrica",    icon: Zap,          iconColor: "text-violet-300" },
  ARQUITETURA:{ label: "Arquitetura",      icon: Building2,    iconColor: "text-violet-400" },
  AMBIENTAL:  { label: "Eng. Ambiental",   icon: Leaf,         iconColor: "text-violet-500" },
  QUIMICA:    { label: "Eng. Química",     icon: FlaskConical, iconColor: "text-violet-300" },
  PRODUCAO:   { label: "Eng. de Produção", icon: Cpu,          iconColor: "text-violet-400" },
};

export default async function HomePage() {
  const supabase = await createClient();

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
    .map((t) => {
      const reviews = (t.reviews as { rating: number }[]) ?? [];
      const avg = reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;
      const prof = Array.isArray(t.professional_profiles)
        ? t.professional_profiles[0]
        : t.professional_profiles;
      return { ...t, prof, avg, reviewCount: reviews.length };
    })
    .filter((t) => t.prof)
    .slice(0, 3);

  // Count professionals per area
  const areaCountMap: Record<string, number> = {};
  (areaCounts ?? []).forEach((p) => {
    const areas = (p.areas as string[]) ?? [];
    areas.forEach((a) => { areaCountMap[a] = (areaCountMap[a] ?? 0) + 1; });
  });

  const displayAreas = Object.keys(AREA_CONFIG).map((key) => ({
    key,
    ...AREA_CONFIG[key],
    count: areaCountMap[key] ?? 0,
  }));

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-violet-950/60 px-4 pb-32 pt-20 text-white">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-700/15 blur-3xl" />
          <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {totalProfessionals ?? 0} profissionais ativos na plataforma
          </div>

          <h1 className="mt-4 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Encontre o profissional
            <span className="block bg-gradient-to-r from-violet-400 to-violet-200 bg-clip-text text-transparent">
              certo para sua obra
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Portfólios verificados, avaliações reais e contato direto com profissionais de engenharia de todo o Brasil.
          </p>

          <div className="mt-10">
            <HeroSearch />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400" />Grátis para clientes</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400" />Sem intermediários</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400" />CREA/CAU verificados</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative mx-auto mt-20 max-w-3xl">
          <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            {[
              { value: totalProfessionals ?? 0, label: "Profissionais" },
              { value: totalReviews ?? 0, label: "Avaliações" },
              { value: totalProjects ?? 0, label: "Projetos" },
            ].map((stat) => (
              <div key={stat.label} className="px-6 py-5 text-center">
                <p className="text-3xl font-bold text-white">{stat.value.toLocaleString("pt-BR")}</p>
                <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AREAS ────────────────────────────────────────── */}
      <section className="px-4 py-24 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 sm:text-4xl">
              Áreas de atuação
            </h2>
            <p className="mt-3 text-gray-500 dark:text-slate-400">
              Encontre o especialista certo para cada tipo de projeto
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
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 via-violet-400 to-purple-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-slate-900" />

                {/* card content */}
                <div className="relative rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 group-hover:border-transparent group-hover:-translate-y-1 group-hover:shadow-xl dark:border-zinc-700/60 dark:bg-zinc-900">
                  <area.icon
                    size={32}
                    strokeWidth={1.5}
                    className={`mb-4 ${area.iconColor} transition-transform duration-300 group-hover:scale-110`}
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100">{area.label}</h3>
                  <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">
                    {area.count} profissional{area.count !== 1 ? "is" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP PROFESSIONALS ────────────────────────────── */}
      {professionalsWithRating.length > 0 && (
        <section className="bg-gray-50 px-4 py-24 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 sm:text-4xl">
                  Profissionais em destaque
                </h2>
                <p className="mt-2 text-gray-500 dark:text-slate-400">
                  Selecionados pela equipe EngHub
                </p>
              </div>
              <Link href="/buscar" className="hidden text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 sm:block">
                Ver todos →
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
                    className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
                          {p.name}
                        </p>
                        {(p.prof?.city || p.prof?.state) && (
                          <p className="truncate text-xs text-gray-400 dark:text-slate-500">
                            {[p.prof.city, p.prof.state].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>

                    {p.prof?.bio && (
                      <p className="mt-3 line-clamp-2 text-sm text-gray-500 dark:text-slate-400">{p.prof.bio}</p>
                    )}

                    {areas.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {areas.slice(0, 2).map((a: string) => (
                          <span key={a} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {AREA_CONFIG[a]?.label ?? a}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-slate-700">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          {p.avg > 0 ? p.avg.toFixed(1) : "—"}
                        </span>
                        {p.reviewCount > 0 && (
                          <span className="text-xs text-gray-400 dark:text-slate-500">({p.reviewCount})</span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        Ver perfil →
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
      <section className="px-4 py-24 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 sm:text-4xl">
              Como funciona
            </h2>
            <p className="mt-3 text-gray-500 dark:text-slate-400">Em 3 passos simples</p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* For clients */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                <Users size={14} />
                Para clientes
              </div>
              <div className="space-y-6">
                {[
                  { step: "1", title: "Busque por área", desc: "Filtre por especialidade, cidade ou nome" },
                  { step: "2", title: "Veja o portfólio", desc: "Projetos, avaliações e contato direto" },
                  { step: "3", title: "Entre em contato", desc: "Mensagem, WhatsApp ou solicitação de orçamento" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-slate-100">{item.title}</p>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/buscar" className="mt-8 block">
                <Button className="w-full bg-violet-600 hover:bg-violet-500">
                  Buscar profissionais
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>

            {/* For engineers */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                <HardHat size={14} />
                Para profissionais
              </div>
              <div className="space-y-6">
                {[
                  { step: "1", title: "Crie seu perfil", desc: "Cadastro gratuito em menos de 5 minutos" },
                  { step: "2", title: "Mostre seus projetos", desc: "Portfólio com fotos, descrições e áreas" },
                  { step: "3", title: "Receba clientes", desc: "Mensagens e orçamentos direto no dashboard" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-700 text-sm font-bold text-white">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-slate-100">{item.title}</p>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/cadastro" className="mt-8 block">
                <Button variant="secondary" className="w-full">
                  Criar meu perfil grátis
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY ENGHUB ───────────────────────────────────── */}
      <section className="bg-gray-50 px-4 py-24 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-slate-100 sm:text-4xl">
            Por que o EngHub?
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
                title: "CREA/CAU Verificados",
                desc: "Apenas profissionais com registro ativo nos conselhos regionais",
              },
              {
                icon: Star,
                color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400",
                title: "Avaliações reais",
                desc: "Reviews de clientes verificados, sem moderação tendenciosa",
              },
              {
                icon: Users,
                color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",
                title: "Comunidade ativa",
                desc: "Rede crescente de engenheiros de todo o Brasil",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-900/20">
                  <f.icon size={26} className="text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-violet-950 to-zinc-900 px-4 py-24 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold">Pronto para começar?</h2>
          <p className="mt-4 text-lg text-zinc-400">
            Cadastro gratuito. Sem cartão de crédito. Comece em 5 minutos.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/cadastro">
              <Button size="lg" className="bg-violet-600 text-white hover:bg-violet-500">
                Criar perfil grátis
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="/buscar">
              <Button size="lg" variant="ghost" className="!text-zinc-300 hover:!bg-white/5">
                Buscar profissionais
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
