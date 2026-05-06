import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default async function AvaliacoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, author:profiles(name, email)")
    .eq("tenant_id", tenant?.id ?? "")
    .order("created_at", { ascending: false });

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const fiveStars = reviews?.filter((r) => r.rating === 5).length ?? 0;
  const recommend =
    reviews && reviews.length > 0
      ? Math.round((fiveStars / reviews.length) * 100)
      : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Avaliações</h1>
      <p className="mt-1 text-gray-500">Veja as avaliações dos seus clientes</p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-gray-900">
              {avgRating > 0 ? avgRating.toFixed(1) : "-"}
            </p>
            <p className="mt-1 text-2xl">
              {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
            </p>
            <p className="mt-2 text-sm text-gray-500">Avaliação média</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-gray-900">{reviews?.length ?? 0}</p>
            <p className="mt-2 text-sm text-gray-500">Total de avaliações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-4xl font-bold text-gray-900">{recommend}%</p>
            <p className="mt-2 text-sm text-gray-500">Deram 5 estrelas</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Todas as Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews && reviews.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {reviews.map((r) => {
                const author = r.author as unknown as { name: string; email: string } | null;
                return (
                  <li key={r.id} className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {author?.name ?? "Anônimo"}
                        </p>
                        <p className="text-sm text-yellow-500">
                          {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                          <span className="ml-1 text-gray-400">{r.rating}/5</span>
                        </p>
                        {r.comment && (
                          <p className="mt-2 text-sm text-gray-600">{r.comment}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <MessageSquare size={32} className="text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">Nenhuma avaliação ainda</p>
              <p className="mt-1 text-xs text-gray-400">
                Compartilhe seu perfil com clientes para receber avaliações
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
