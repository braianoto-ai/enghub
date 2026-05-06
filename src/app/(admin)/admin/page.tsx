import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Users, Building2, Star, MessageSquare, TrendingUp, Clock, Sparkles, CreditCard } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: tenantCount },
    { count: tenantActiveCount },
    { count: reviewCount },
    { count: convCount },
    { count: newTenantsMonth },
    { count: newTenantsWeek },
    { count: trialCount },
    { data: recentTenants },
    { data: planDist },
    { data: recentReviews },
  ] = await Promise.all([
    supabase.from("tenants").select("*", { count: "exact", head: true }),
    supabase.from("tenants").select("*", { count: "exact", head: true }).eq("status", "ACTIVE"),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("conversations").select("*", { count: "exact", head: true }),
    supabase.from("tenants").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabase.from("tenants").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    supabase.from("tenants").select("*", { count: "exact", head: true })
      .eq("plan", "PRO")
      .not("trial_ends_at", "is", null)
      .gte("trial_ends_at", now.toISOString()),
    supabase.from("tenants")
      .select("id, name, slug, plan, status, created_at, trial_ends_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("tenants").select("plan"),
    supabase.from("reviews")
      .select("id, rating, comment, reviewer_name, created_at, tenant_id, tenants(name, slug)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const planCounts = (planDist ?? []).reduce<Record<string, number>>((acc, t) => {
    acc[t.plan] = (acc[t.plan] ?? 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: "Total de perfis", value: tenantCount ?? 0, sub: `${tenantActiveCount ?? 0} ativos`, icon: Building2, color: "violet" },
    { label: "Novos (30 dias)", value: newTenantsMonth ?? 0, sub: `${newTenantsWeek ?? 0} esta semana`, icon: TrendingUp, color: "green" },
    { label: "Em trial PRO", value: trialCount ?? 0, sub: "trials ativos", icon: Clock, color: "amber" },
    { label: "Conversas", value: convCount ?? 0, sub: "via chat", icon: MessageSquare, color: "blue" },
    { label: "Avaliações", value: reviewCount ?? 0, sub: "no total", icon: Star, color: "yellow" },
  ];

  const colorMap: Record<string, string> = {
    violet: "bg-gray-100 text-gray-700 dark:bg-gray-800/20 dark:text-gray-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    blue: "bg-gray-100 text-gray-600 dark:bg-gray-700/20 dark:text-gray-400",
    yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
  };

  const planColors: Record<string, string> = {
    FREE: "bg-gray-100 text-gray-600",
    PRO: "bg-gray-200 text-gray-800",
    EMPRESA: "bg-gray-200 text-gray-700",
    PREMIUM: "bg-amber-100 text-amber-700",
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    SUSPENDED: "bg-red-100 text-red-700",
    PENDING: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Painel Administrativo</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Visão geral da plataforma EngHub</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[s.color]}`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{s.value}</p>
            <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-slate-400">{s.label}</p>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent tenants */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-800">
            <h2 className="font-semibold text-gray-900 dark:text-slate-100">Cadastros recentes</h2>
            <Link href="/admin/tenants" className="text-sm text-gray-700 hover:underline dark:text-gray-400">Ver todos →</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {(recentTenants ?? []).map((t) => {
              const isOnTrial = t.trial_ends_at && new Date(t.trial_ends_at) > now;
              return (
                <div key={t.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-slate-100">{t.name}</p>
                      {isOnTrial && (
                        <span className="flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                          <Clock size={9} /> trial
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-slate-500">/{t.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${planColors[t.plan] ?? "bg-gray-100 text-gray-600"}`}>{t.plan}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[t.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {t.status === "ACTIVE" ? "Ativo" : t.status === "SUSPENDED" ? "Suspenso" : "Pendente"}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">{new Date(t.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan distribution */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-gray-100 px-5 py-4 dark:border-slate-800">
            <h2 className="font-semibold text-gray-900 dark:text-slate-100">Distribuição de planos</h2>
          </div>
          <div className="space-y-4 p-5">
            {(["FREE", "PRO", "EMPRESA", "PREMIUM"] as const).map((plan) => {
              const count = planCounts[plan] ?? 0;
              const total = tenantCount ?? 1;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={plan}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-slate-300">{plan}</span>
                    <span className="text-gray-500 dark:text-slate-400">{count} <span className="text-gray-400">({pct}%)</span></span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-gray-1000 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-100 p-5 dark:border-slate-800">
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-slate-300">Ações rápidas</h3>
            <div className="space-y-2">
              <Link href="/admin/tenants" className="flex items-center gap-2 rounded-lg p-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800">
                <Building2 size={15} /> Gerenciar perfis
              </Link>
              <Link href="/admin/avaliacoes" className="flex items-center gap-2 rounded-lg p-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800">
                <Star size={15} /> Moderar avaliações
              </Link>
              <Link href="/admin/usuarios" className="flex items-center gap-2 rounded-lg p-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800">
                <Users size={15} /> Ver usuários
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent reviews */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-800">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100">Avaliações recentes</h2>
          <Link href="/admin/avaliacoes" className="text-sm text-gray-700 hover:underline dark:text-gray-400">Ver todas →</Link>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {(recentReviews ?? []).map((r) => {
            const tenant = r.tenants as unknown as { name: string; slug: string } | null;
            return (
              <div key={r.id} className="flex items-start justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{r.reviewer_name}</p>
                    <span className="text-yellow-500 text-xs">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  </div>
                  {r.comment && <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-slate-400">{r.comment}</p>}
                  {tenant && (
                    <Link href={`/${tenant.slug}`} target="_blank" className="mt-0.5 text-xs text-gray-500 hover:underline">
                      {tenant.name}
                    </Link>
                  )}
                </div>
                <span className="shrink-0 text-xs text-gray-400 dark:text-slate-500">
                  {new Date(r.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
