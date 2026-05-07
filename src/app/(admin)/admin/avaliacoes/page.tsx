import { createClient } from "@/lib/supabase/server";
import { AvaliacoesAdminClient } from "./avaliacoes-admin-client";

export default async function AvaliacoesAdminPage() {
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, reviewer_name, created_at, tenants(name, slug)")
    .order("created_at", { ascending: false });

  const flat = (reviews ?? []).map((r) => {
    const tenant = r.tenants as unknown as { name: string; slug: string } | null;
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      reviewer_name: r.reviewer_name,
      created_at: r.created_at,
      tenant_name: tenant?.name ?? "—",
      tenant_slug: tenant?.slug ?? "",
    };
  });

  const avgRating = flat.length
    ? (flat.reduce((s, r) => s + r.rating, 0) / flat.length).toFixed(1)
    : "—";

  const dist = [5, 4, 3, 2, 1].map((n) => ({
    star: n,
    count: flat.filter((r) => r.rating === n).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Avaliações</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          {flat.length} avaliação{flat.length !== 1 ? "ões" : ""} · Nota média: {avgRating}
        </p>
      </div>

      {/* Distribution */}
      <div className="grid grid-cols-5 gap-3">
        {dist.map((d) => (
          <div key={d.star} className="rounded-2xl border border-gray-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-lg text-yellow-400">{"★".repeat(d.star)}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-zinc-100">{d.count}</p>
            <p className="text-xs text-gray-400 dark:text-zinc-500">{d.star} estrela{d.star !== 1 ? "s" : ""}</p>
          </div>
        ))}
      </div>

      <AvaliacoesAdminClient reviews={flat} />
    </div>
  );
}
