import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FolderOpen, Star, MessageSquare } from "lucide-react";
import { redirect } from "next/navigation";
import { OnboardingCard } from "./onboarding-card";
import { AvailabilitySwitcher, type AvailabilityStatus } from "@/components/availability-switcher";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, slug, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  const tenantId = tenant?.id;

  const [
    { count: projectCount },
    { count: serviceCount },
    { count: reviewCount },
    { data: reviews },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId ?? "")
      .eq("status", "PUBLISHED"),
    supabase
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId ?? ""),
    supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId ?? ""),
    supabase
      .from("reviews")
      .select("rating, comment, created_at, author:profiles(name)")
      .eq("tenant_id", tenantId ?? "")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("profiles")
      .select("bio, phone, whatsapp, linkedin, availability")
      .eq("tenant_id", tenantId ?? "")
      .maybeSingle(),
  ]);

  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const stats = [
    { label: "Projetos publicados", value: projectCount ?? 0, icon: FolderOpen },
    { label: "Avaliação média",      value: avgRating ?? "-",  icon: Star },
    { label: "Avaliações recebidas", value: reviewCount ?? 0,  icon: MessageSquare },
    { label: "Visitas ao perfil",    value: "Em breve",         icon: Eye },
  ];

  const hasContact = !!(profile?.phone || profile?.whatsapp || profile?.linkedin);

  const onboardingSteps = [
    {
      id: "perfil",
      label: "Complete seu perfil",
      description: "Adicione bio, cidade e anos de experiência",
      href: "/dashboard/perfil",
      done: !!(profile?.bio && profile.bio.trim().length > 20),
    },
    {
      id: "contato",
      label: "Adicione um contato",
      description: "Telefone, WhatsApp ou LinkedIn para os clientes te encontrarem",
      href: "/dashboard/perfil",
      done: hasContact,
    },
    {
      id: "projeto",
      label: "Publique seu primeiro projeto",
      description: "Mostre seu trabalho com fotos e descrição detalhada",
      href: "/dashboard/projetos/novo",
      done: (projectCount ?? 0) > 0,
    },
    {
      id: "servico",
      label: "Cadastre um serviço",
      description: "Informe o que você oferece e os valores praticados",
      href: "/dashboard/servicos",
      done: (serviceCount ?? 0) > 0,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Painel</h1>
      <p className="mt-1 text-gray-500 dark:text-slate-400">Bem-vindo ao seu painel de controle</p>

      <div className="mt-6">
        <OnboardingCard steps={onboardingSteps} slug={tenant?.slug ?? ""} />
      </div>

      {/* Widget de disponibilidade rápida */}
      {tenant?.id && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Sua disponibilidade</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Visível no seu perfil público</p>
          </div>
          <AvailabilitySwitcher
            tenantId={tenant.id}
            initial={(profile?.availability as AvailabilityStatus) ?? "available"}
            compact
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {stat.value}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-900/30">
                  <stat.icon size={24} className="text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimas Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews && reviews.length > 0 ? (
              <ul className="space-y-4">
                {reviews.map((r, i) => (
                  <li key={i} className="border-b border-gray-100 pb-3 last:border-0 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {(r.author as unknown as { name: string } | null)?.name ?? "Anônimo"}
                      </span>
                      <span className="text-sm text-yellow-500">
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{r.comment}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-32 items-center justify-center text-gray-400">
                Nenhuma avaliação ainda
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dicas para crescer</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-slate-400">
              {[
                "Adicione fotos reais dos seus projetos — perfis com imagens recebem 3x mais contatos",
                "Preencha o número do CREA/CAU para aumentar a confiança dos clientes",
                "Compartilhe seu link do EngHub no LinkedIn e WhatsApp",
                "Responda avaliações para mostrar que você se importa com seus clientes",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
