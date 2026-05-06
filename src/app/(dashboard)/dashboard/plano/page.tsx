import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import Link from "next/link";

const PLAN_CONFIG: Record<
  string,
  {
    label: string;
    color: "default" | "info" | "success" | "warning";
    projectLimit: number | null;
    serviceLimit: number | null;
    features: string[];
    price: string;
  }
> = {
  FREE: {
    label: "Gratuito",
    color: "default",
    projectLimit: 5,
    serviceLimit: 3,
    features: [
      "Até 5 projetos no portfólio",
      "Até 3 serviços cadastrados",
      "Página pública básica",
      "Aparecer nas buscas",
      "Receber avaliações",
    ],
    price: "R$ 0",
  },
  PRO: {
    label: "Pro",
    color: "info",
    projectLimit: null,
    serviceLimit: null,
    features: [
      "Projetos ilimitados",
      "Serviços ilimitados",
      "Subdomínio personalizado",
      "Destaque nas buscas",
      "Selo de verificado",
      "Estatísticas de visitas",
      "Suporte prioritário",
    ],
    price: "R$ 49/mês",
  },
  EMPRESA: {
    label: "Empresa",
    color: "success",
    projectLimit: null,
    serviceLimit: null,
    features: [
      "Tudo do Pro",
      "Até 10 membros na equipe",
      "Página da empresa",
      "Domínio próprio",
      "Relatórios avançados",
      "API de integração",
    ],
    price: "R$ 129/mês",
  },
  PREMIUM: {
    label: "Premium",
    color: "warning",
    projectLimit: null,
    serviceLimit: null,
    features: [
      "Tudo do Empresa",
      "Membros ilimitados",
      "Templates de documentos técnicos",
      "Integração com CREA",
      "Gerente de conta dedicado",
      "SLA garantido",
    ],
    price: "R$ 299/mês",
  },
};

const UPGRADE_ORDER = ["FREE", "PRO", "EMPRESA", "PREMIUM"];

export default async function PlanoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, plan")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tenant) redirect("/login");

  const [{ count: projectCount }, { count: serviceCount }] = await Promise.all([
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id),
    supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id),
  ]);

  const plan = PLAN_CONFIG[tenant.plan] ?? PLAN_CONFIG.FREE;
  const currentIndex = UPGRADE_ORDER.indexOf(tenant.plan);
  const nextPlans = UPGRADE_ORDER.slice(currentIndex + 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Meu Plano</h1>
      <p className="mt-1 text-gray-500">Gerencie seu plano e recursos</p>

      {/* Current plan */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Plano Atual</CardTitle>
              <Badge variant={plan.color}>{plan.label}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{plan.price}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={15} className="text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Usage */}
        <div className="space-y-4">
          <UsageStat
            label="Projetos"
            used={projectCount ?? 0}
            limit={plan.projectLimit}
          />
          <UsageStat
            label="Serviços"
            used={serviceCount ?? 0}
            limit={plan.serviceLimit}
          />
        </div>
      </div>

      {/* Upgrade options */}
      {nextPlans.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-violet-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Faça upgrade
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Desbloqueie mais recursos para o seu negócio
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nextPlans.map((planKey) => {
              const p = PLAN_CONFIG[planKey];
              return (
                <Card
                  key={planKey}
                  className={planKey === "PRO" ? "border-violet-500 ring-1 ring-violet-500" : ""}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{p.label}</CardTitle>
                      {planKey === "PRO" && (
                        <Badge variant="info">Popular</Badge>
                      )}
                    </div>
                    <p className="text-xl font-bold text-gray-900">{p.price}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {p.features.slice(0, 4).map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <Check size={14} className="mt-0.5 text-green-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/planos"
                      className="mt-4 block w-full rounded-lg bg-violet-600 py-2 text-center text-sm font-medium text-white hover:bg-violet-700 transition-colors"
                    >
                      Ver detalhes
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="mt-4 text-center text-sm text-gray-400">
            Para fazer upgrade, entre em contato:{" "}
            <a
              href="mailto:contato@enghub.com.br"
              className="text-violet-600 hover:underline"
            >
              contato@enghub.com.br
            </a>
          </p>
        </div>
      )}

      {tenant.plan === "PREMIUM" && (
        <div className="mt-10 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-6 text-center">
          <p className="text-lg font-semibold text-gray-900">
            Você está no plano máximo 🏆
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Aproveite todos os recursos Premium do EngHub.
          </p>
        </div>
      )}
    </div>
  );
}

function UsageStat({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const pct = limit ? Math.min((used / limit) * 100, 100) : 0;
  const nearLimit = limit && used >= limit * 0.8;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">{label}</span>
          <span className={nearLimit ? "font-semibold text-orange-600" : "text-gray-500"}>
            {used}
            {limit ? ` / ${limit}` : " / ∞"}
          </span>
        </div>
        {limit ? (
          <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
            <div
              className={`h-2 rounded-full transition-all ${
                pct >= 100
                  ? "bg-red-500"
                  : pct >= 80
                  ? "bg-orange-400"
                  : "bg-violet-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        ) : (
          <p className="mt-2 text-xs text-gray-400">Ilimitado</p>
        )}
      </CardContent>
    </Card>
  );
}
