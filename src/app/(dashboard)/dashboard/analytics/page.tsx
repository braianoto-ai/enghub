import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MessageSquare, Star, TrendingUp } from "lucide-react";

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

  if (!tenant) redirect("/login");

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
      .select("created_at")
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
      .select("created_at")
      .eq("tenant_id", tenant.id)
      .gte("created_at", thirtyDaysAgo.toISOString()),
  ]);

  const totalViews = allViews?.length ?? 0;

  // Views por dia nos últimos 30 dias
  const last30 = getLast30Days();
  const viewsByDay: Record<string, number> = {};
  last30.forEach((d) => (viewsByDay[d] = 0));
  (recentViews ?? []).forEach((v) => {
    const day = v.created_at.slice(0, 10);
    if (viewsByDay[day] !== undefined) viewsByDay[day]++;
  });

  const viewsThisMonth = recentViews?.length ?? 0;

  // Views nos últimos 7 dias
  const last7 = getLast7Days();
  const viewsThisWeek = last7.reduce((sum, d) => sum + (viewsByDay[d] ?? 0), 0);

  // Barras do gráfico de 30 dias
  const maxViews = Math.max(...Object.values(viewsByDay), 1);

  // Últimos 7 dias para o mini gráfico
  const weekData = last7.map((day) => ({
    label: DAY_LABELS[new Date(day + "T12:00:00").getDay()],
    count: viewsByDay[day] ?? 0,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <p className="mt-1 text-gray-500">Desempenho do seu perfil público</p>

      {/* Stats cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Eye size={20} className="text-violet-600" />}
          label="Visitas totais"
          value={totalViews}
          bg="bg-violet-50"
        />
        <StatCard
          icon={<TrendingUp size={20} className="text-indigo-600" />}
          label="Este mês"
          value={viewsThisMonth}
          bg="bg-indigo-50"
        />
        <StatCard
          icon={<MessageSquare size={20} className="text-green-600" />}
          label="Mensagens"
          value={totalMessages ?? 0}
          bg="bg-green-50"
        />
        <StatCard
          icon={<Star size={20} className="text-yellow-600" />}
          label="Avaliações"
          value={totalReviews ?? 0}
          bg="bg-yellow-50"
        />
      </div>

      {/* Weekly bar chart */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Visitas — últimos 7 dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-40">
            {weekData.map((d, i) => {
              const pct = maxViews > 0 ? (d.count / maxViews) * 100 : 0;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-medium text-gray-600">
                    {d.count > 0 ? d.count : ""}
                  </span>
                  <div className="relative w-full">
                    <div
                      className="w-full rounded-t-md bg-violet-500 transition-all"
                      style={{ height: `${Math.max(pct, 4)}px`, minHeight: d.count > 0 ? "8px" : "4px" }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{d.label}</span>
                </div>
              );
            })}
          </div>
          {viewsThisWeek === 0 && (
            <p className="mt-4 text-center text-sm text-gray-400">
              Nenhuma visita nos últimos 7 dias. Compartilhe seu perfil!
            </p>
          )}
        </CardContent>
      </Card>

      {/* 30-day chart */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visitas — últimos 30 dias</CardTitle>
            <span className="text-sm text-gray-500">{viewsThisMonth} visitas</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-0.5 h-24">
            {last30.map((day) => {
              const count = viewsByDay[day] ?? 0;
              const pct = maxViews > 0 ? (count / maxViews) * 100 : 0;
              return (
                <div
                  key={day}
                  title={`${day}: ${count} visita${count !== 1 ? "s" : ""}`}
                  className="flex-1 rounded-t-sm bg-violet-400 transition-all hover:bg-violet-600"
                  style={{ height: `${Math.max(pct, 2)}%`, minHeight: count > 0 ? "6px" : "2px", opacity: count > 0 ? 1 : 0.2 }}
                />
              );
            })}
          </div>
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>30 dias atrás</span>
            <span>Hoje</span>
          </div>
        </CardContent>
      </Card>

      {/* Conversion */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ConversionRow
              label="Visitas → Mensagens"
              numerator={totalMessages ?? 0}
              denominator={totalViews}
            />
            <ConversionRow
              label="Visitas → Avaliações"
              numerator={totalReviews ?? 0}
              denominator={totalViews}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className={`inline-flex rounded-lg p-2 ${bg}`}>{icon}</div>
        <p className="mt-3 text-2xl font-bold text-gray-900">{value.toLocaleString("pt-BR")}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );
}

function ConversionRow({
  label,
  numerator,
  denominator,
}: {
  label: string;
  numerator: number;
  denominator: number;
}) {
  const pct = denominator > 0 ? ((numerator / denominator) * 100).toFixed(1) : "0.0";
  const barPct = denominator > 0 ? Math.min((numerator / denominator) * 100, 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">
          {numerator} / {denominator} ({pct}%)
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-violet-500 transition-all"
          style={{ width: `${barPct}%` }}
        />
      </div>
    </div>
  );
}
