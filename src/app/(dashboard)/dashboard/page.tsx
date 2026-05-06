import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FolderOpen, Star, MessageSquare } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  const tenantId = tenant?.id;

  const [{ count: projectCount }, { count: reviewCount }, { data: reviews }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId ?? "")
        .eq("status", "PUBLISHED"),
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
    ]);

  const avgRating =
    reviews && reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  const stats = [
    {
      label: "Projetos publicados",
      value: projectCount ?? 0,
      icon: FolderOpen,
    },
    {
      label: "Avaliação média",
      value: avgRating ?? "-",
      icon: Star,
    },
    {
      label: "Avaliações recebidas",
      value: reviewCount ?? 0,
      icon: MessageSquare,
    },
    {
      label: "Visitas ao perfil",
      value: "Em breve",
      icon: Eye,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Painel</h1>
      <p className="mt-1 text-gray-500">Bem-vindo ao seu painel de controle</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                  <stat.icon size={24} className="text-blue-600" />
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
                  <li key={i} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {(r.author as unknown as { name: string } | null)?.name ?? "Anônimo"}
                      </span>
                      <span className="text-sm text-yellow-500">
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="mt-1 text-sm text-gray-500">{r.comment}</p>
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
            <CardTitle>Dicas para começar</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">1</span>
                Complete seu perfil com bio e informações de contato
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">2</span>
                Adicione projetos ao seu portfólio
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">3</span>
                Cadastre os serviços que você oferece
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">4</span>
                Compartilhe seu perfil público com clientes
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
