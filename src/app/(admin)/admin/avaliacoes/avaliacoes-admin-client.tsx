"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, ExternalLink, Search, Filter } from "lucide-react";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  reviewer_name: string;
  created_at: string;
  tenant_name: string;
  tenant_slug: string;
}

export function AvaliacoesAdminClient({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    await supabase.from("reviews").delete().eq("id", id);
    setConfirmId(null);
    setDeleting(null);
    router.refresh();
  }

  const filtered = reviews.filter((r) => {
    const matchSearch =
      !search ||
      r.reviewer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.tenant_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.comment ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRating =
      filterRating === "all" || r.rating === Number(filterRating);
    return matchSearch && matchRating;
  });

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por avaliador, profissional ou texto..."
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="all">Todas as notas</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{"★".repeat(r)} {r} estrela{r !== 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-500 dark:text-slate-400">
        {filtered.length} de {reviews.length} avaliações
      </p>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-800">
              {["Avaliador", "Profissional", "Nota", "Comentário", "Data", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400 dark:text-slate-500">
                  Nenhuma avaliação encontrada
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{r.reviewer_name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/${r.tenant_slug}`}
                      target="_blank"
                      className="flex items-center gap-1 text-sm text-violet-600 hover:underline dark:text-violet-400"
                    >
                      {r.tenant_name}
                      <ExternalLink size={11} />
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm text-yellow-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                      <p className="text-xs text-gray-400">{r.rating}/5</p>
                    </div>
                  </td>
                  <td className="max-w-xs px-5 py-4">
                    <p className="truncate text-sm text-gray-600 dark:text-slate-400">
                      {r.comment ?? <span className="italic text-gray-300 dark:text-slate-600">Sem comentário</span>}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-4">
                    {confirmId === r.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deleting === r.id}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
                        >
                          {deleting === r.id ? "..." : "Confirmar"}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(r.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        title="Excluir avaliação"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
