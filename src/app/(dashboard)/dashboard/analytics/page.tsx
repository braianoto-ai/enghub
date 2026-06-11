import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Eye, MessageSquare, Star, TrendingUp, Globe, Share2, Search, Smartphone, Lightbulb } from "lucide-react";

function getLast30Days() {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getLast7Days() {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function categorizeReferrer(referrer: string | null): string {
  if (!referrer) return "Direto";
  const r = referrer.toLowerCase();
  if (r.includes("google") || r.includes("bing") || r.includes("yahoo")) return "Busca (Google)";
  if (r.includes("linkedin")) return "LinkedIn";
  if (r.includes("whatsapp") || r.includes("wa.me")) return "WhatsApp";
  if (r.includes("instagram") || r.includes("facebook") || r.includes("twitter") || r.includes("t.co")) return "Redes Sociais";
  if (r.includes("enghub")) return "EngHub";
  return "Outro";
}

const SOURCE_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  "Direto":          { icon: <Globe size={15} />,      color: "text-gray-700",  bg: "bg-gray-200 dark:bg-gray-700/40" },
  "Busca (Google)":  { icon: <Search size={15} />,     color: "text-gray-600",    bg: "bg-gray-200 dark:bg-gray-700/40" },
  "WhatsApp":        { icon: <Smartphone size={15} />, color: "text-green-600",   bg: "bg-green-100 dark:bg-green-900/40" },
  "LinkedIn":        { icon: <Share2 size={15} />,     color: "text-gray-700",    bg: "bg-gray-200 dark:bg-gray-700/40" },
  "Redes Sociais":   { icon: <Share2 size={15} />,     color: "text-pink-600",    bg: "bg-pink-100 dark:bg-pink-900/40" },
  "EngHub":          { icon: <Globe size={15} />,      color: "text-gray-800",  bg: "bg-gray-200 dark:bg-gray-700/40" },
  "Outro":           { icon: <Globe size={15} />,      color: "text-zinc-500",    bg: "bg-zinc-100 dark:bg-zinc-800" },
};

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tenant) redirect("/dashboard");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    { data: allViews },
    { count: totalMessages },
    { count: totalReviews },
    { data: recentViews },
  ] = await Promise.all([
    supabase
      .from("profile_views")
      .select("created_at, referrer")
      .eq("tenant_id", tenant.id),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id),
    supabase
      .from("profile_views")
      .select("created_at, referrer")
      .eq("tenant_id", tenant.id)
      .gte("created_at", thirtyDaysAgo.toISOString()),
  ]);

  const totalViews = allViews?.length ?? 0;
  const viewsThisMonth = recentViews?.length ?? 0;

  // Views por dia nos últimos 30 dias
  const last30 = getLast30Days();
  const last7 = getLast7Days();
  const viewsByDay: Record<string, number> = {};
  last30.forEach((d) => (viewsByDay[d] = 0));
  (recentViews ?? []).forEach((v) => {
    const day = v.created_at.slice(0, 10);
    if (viewsByDay[day] !== undefined) viewsByDay[day]++;
  });

  const viewsThisWeek = last7.reduce((sum, d) => sum + (viewsByDay[d] ?? 0), 0);
  const maxViews = Math.max(...Object.values(viewsByDay), 1);

  const weekData = last7.map((day) => ({
    label: DAY_LABELS[new Date(day + "T12:00:00").getDay()],
    count: viewsByDay[day] ?? 0,
    date: day,
  }));

  // Origem das visitas (todos os tempos)
  const sourceCount: Record<string, number> = {};
  (allViews ?? []).forEach((v) => {
    const cat = categorizeReferrer(v.referrer);
    sourceCount[cat] = (sourceCount[cat] ?? 0) + 1;
  });
  const sources = Object.entries(sourceCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      pct: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
      ...(SOURCE_ICONS[name] ?? SOURCE_ICONS["Outro"]),
    }));

  // Tendência: compara esta semana com a anterior
  const prevWeekStart = new Date();
  prevWeekStart.setDate(prevWeekStart.getDate() - 14);
  const prevWeekEnd = new Date();
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
  const prevWeekViews = (allViews ?? []).filter((v) => {
    const d = new Date(v.created_at);
    return d >= prevWeekStart && d < prevWeekEnd;
  }).length;
  const trendPct = prevWeekViews > 0
    ? Math.round(((viewsThisWeek - prevWeekViews) / prevWeekViews) * 100)
    : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Analytics</h1>
      <p className="mt-1 text-gray-500 dark:text-zinc-400">Desempenho do seu perfil público</p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Eye, label: "Visitas totais", value: totalViews, color: "text-gray-700", bg: "bg-gray-100 dark:bg-gray-800/30" },
          { icon: TrendingUp, label: "Este mês", value: viewsThisMonth, color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-800/30" },
          { icon: MessageSquare, label: "Mensagens", value: totalMessages ?? 0, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/30" },
          { icon: Star, label: "Avaliações", value: totalReviews ?? 0, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/30" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className={`inline-flex rounded-xl p-2.5 ${s.bg}`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-zinc-100">
              {s.value.toLocaleString("pt-BR")}
            </p>
            <p className="text-sm text-gray-500 dark:text-zinc-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gráfico 7 dias */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Visitas — últimos 7 dias</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {viewsThisWeek} visitas esta semana
                {trendPct !== null && (
                  <span className={`ml-2 font-semibold ${trendPct >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {trendPct >= 0 ? "▲" : "▼"} {Math.abs(trendPct)}% vs semana anterior
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between gap-3 h-36">
            {weekData.map((d, i) => {
              const pct = maxViews > 0 ? (d.count / maxViews) * 100 : 0;
              const isToday = d.date === new Date().toISOString().slice(0, 10);
              return (
                <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div className="relative w-full flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all ${isToday ? "bg-gray-700" : "bg-gray-400 dark:bg-gray-800 group-hover:bg-gray-600"}`}
                      style={{ height: `${Math.max(pct, d.count > 0 ? 8 : 3)}%`, minHeight: d.count > 0 ? "8px" : "3px" }}
                    />
                  </div>
                  <span className={`text-xs ${isToday ? "font-bold text-gray-700" : "text-zinc-400"}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          {viewsThisWeek === 0 && (
            <p className="mt-3 text-center text-sm text-zinc-400">
              Nenhuma visita esta semana. Compartilhe seu perfil!
            </p>
          )}

          {/* Gráfico 30 dias */}
          <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 mb-2">Últimos 30 dias</p>
            <div className="flex items-end gap-0.5 h-10">
              {last30.map((day) => {
                const count = viewsByDay[day] ?? 0;
                const pct = maxViews > 0 ? (count / maxViews) * 100 : 0;
                return (
                  <div
                    key={day}
                    title={`${day.slice(5)}: ${count} visita${count !== 1 ? "s" : ""}`}
                    className="flex-1 rounded-t-sm bg-gray-500 dark:bg-gray-700 transition-all hover:bg-gray-700 dark:hover:bg-gray-500"
                    style={{ height: `${Math.max(pct, 2)}%`, minHeight: count > 0 ? "4px" : "2px", opacity: count > 0 ? 1 : 0.15 }}
                  />
                );
              })}
            </div>
            <div className="mt-1 flex justify-between text-xs text-zinc-400">
              <span>30 dias atrás</span>
              <span>Hoje</span>
            </div>
          </div>
        </div>

        {/* Origem das visitas */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Origem das visitas</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Todos os tempos</p>

          {sources.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Globe size={28} className="opacity-30" />
              <p className="text-sm text-center">Sem dados ainda. As origens aparecem conforme seu perfil recebe visitas.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {sources.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                        {s.icon}
                      </div>
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{s.count}</span>
                      <span className="text-xs text-zinc-400">{s.pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-1.5 rounded-full bg-gray-1000 transition-all"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conversão */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Taxa de conversão</h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Visitantes que tomaram uma ação</p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Visitas → Mensagens", num: totalMessages ?? 0, den: totalViews, color: "bg-green-500" },
            { label: "Visitas → Avaliações", num: totalReviews ?? 0, den: totalViews, color: "bg-amber-400" },
          ].map((row) => {
            const pct = row.den > 0 ? ((row.num / row.den) * 100).toFixed(1) : "0.0";
            const barPct = row.den > 0 ? Math.min((row.num / row.den) * 100, 100) : 0;
            return (
              <div key={row.label} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-zinc-600 dark:text-zinc-400">{row.label}</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{pct}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div className={`h-2 rounded-full ${row.color} transition-all`} style={{ width: `${barPct}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-zinc-400">{row.num} de {row.den} visitantes</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dicas */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800/50 dark:bg-amber-900/20">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={18} className="text-amber-600 dark:text-amber-400" />
          <h2 className="font-semibold text-amber-900 dark:text-amber-300">Dicas para aumentar visitas</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { tip: "Compartilhe o link do seu perfil no status do WhatsApp — alcança toda sua rede de contatos." },
            { tip: "Poste um projeto no LinkedIn com o link do EngHub na descrição." },
            { tip: "Adicione o link do EngHub na bio do seu Instagram profissional." },
            { tip: "Coloque o link na sua assinatura de e-mail." },
            { tip: "Peça para clientes satisfeitos deixarem uma avaliação — aumenta sua posição na busca." },
            { tip: "Complete 100% do perfil: bio, foto, CREA e projetos com imagens reais." },
          ].map((d, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                {i + 1}
              </span>
              {d.tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
