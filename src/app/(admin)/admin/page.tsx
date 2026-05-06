import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Star, MessageSquare } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: tenantCount },
    { count: userCount },
    { count: reviewCount },
    { count: messageCount },
    { data: recentTenants },
    { data: planDist },
  ] = await Promise.all([
    supabase.from("tenants").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }),
    supabase
      .from("tenants")
      .select("id, name, slug, plan, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("tenants")
      .select("plan"),
  ]);

  const planCounts = (planDist ?? []).reduce<Record<string, number>>((acc, t) => {
    acc[t.plan] = (acc[t.plan] ?? 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: "Total de Tenants", value: tenantCount ?? 0, icon: Building2, color: "blue" },
    { label: "Usuários Cadastrados", value: userCount ?? 0, icon: Users, color: "green" },
    { label: "Avaliações", value: reviewCount ?? 0, icon: Star, color: "yellow" },
    { label: "Mensagens de Contato", value: messageCount ?? 0, icon: MessageSquare, color: "purple" },
  ];

  const iconColors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
  };

  const planColors: Record<string, "default" | "info" | "success" | "warning"> = {
    FREE: "default",
    PRO: "info",
    EMPRESA: "success",
    PREMIUM: "warning",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
      <p className="mt-1 text-gray-500">Visão geral da plataforma EngHub</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconColors[stat.color]}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tenants Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTenants && recentTenants.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {recentTenants.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={planColors[t.plan] ?? "default"}>
                        {t.plan}
                      </Badge>
                      <Badge variant={t.status === "ACTIVE" ? "success" : "warning"}>
                        {t.status === "ACTIVE" ? "Ativo" : t.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-32 items-center justify-center text-gray-400">
                Nenhum tenant cadastrado
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(planCounts).length > 0 ? (
              <ul className="space-y-3">
                {(["FREE", "PRO", "EMPRESA", "PREMIUM"] as const).map((plan) => {
                  const count = planCounts[plan] ?? 0;
                  const total = tenantCount ?? 1;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <li key={plan}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{plan}</span>
                        <span className="text-gray-500">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex h-32 items-center justify-center text-gray-400">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
