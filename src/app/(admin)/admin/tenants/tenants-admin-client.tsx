"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, Star, Ban, CheckCircle, CreditCard, Clock, ExternalLink, Filter } from "lucide-react";
import Link from "next/link";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  featured: boolean;
  created_at: string;
  trial_ends_at: string | null;
  is_on_trial: boolean;
  owner_name: string | null;
  owner_email: string | null;
}

const PLANS = ["FREE", "PRO", "EMPRESA", "PREMIUM"];

const planColors: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400",
  PRO: "bg-gray-200 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
  EMPRESA: "bg-gray-200 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
  PREMIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  SUSPENDED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export function TenantsAdminClient({ tenants }: { tenants: Tenant[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  async function update(tenantId: string, data: Record<string, unknown>) {
    setLoadingId(tenantId);
    setOpenMenuId(null);
    await supabase.from("tenants").update(data).eq("id", tenantId);
    router.refresh();
    setLoadingId(null);
  }

  const filtered = tenants.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q) || (t.owner_email ?? "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchPlan = filterPlan === "all" || t.plan === filterPlan;
    return matchSearch && matchStatus && matchPlan;
  });

  return (
    <div>
      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -tranzinc-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, slug ou e-mail..."
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-gray-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500" />
        </div>
        <div className="flex gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
            <option value="all">Todos status</option>
            <option value="ACTIVE">Ativo</option>
            <option value="SUSPENDED">Suspenso</option>
            <option value="PENDING">Pendente</option>
          </select>
          <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
            <option value="all">Todos planos</option>
            {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <p className="mb-3 text-sm text-gray-500 dark:text-zinc-400">{filtered.length} de {tenants.length} perfis</p>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-zinc-800">
              {["Perfil", "Plano", "Status", "Trial", "Cadastro", "Ações"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400 dark:text-zinc-500">Nenhum perfil encontrado</td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className={`hover:bg-gray-50 dark:hover:bg-zinc-800/50 ${loadingId === t.id ? "opacity-50" : ""}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {t.featured && <Star size={13} className="shrink-0 fill-yellow-400 text-yellow-400" />}
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{t.name}</p>
                          <Link href={`/${t.slug}`} target="_blank" className="text-gray-400 hover:text-gray-700">
                            <ExternalLink size={11} />
                          </Link>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-zinc-500">{t.owner_email ?? `/${t.slug}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${planColors[t.plan] ?? ""}`}>{t.plan}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[t.status] ?? ""}`}>
                      {t.status === "ACTIVE" ? "Ativo" : t.status === "SUSPENDED" ? "Suspenso" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {t.is_on_trial ? (
                      <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <Clock size={12} />
                        {new Date(t.trial_ends_at!).toLocaleDateString("pt-BR")}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400 dark:text-zinc-500 whitespace-nowrap">
                    {new Date(t.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      >
                        Ações ▾
                      </button>

                      {openMenuId === t.id && (
                        <div className="absolute right-0 top-8 z-20 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                          <div className="border-b border-gray-100 px-3 py-2 dark:border-zinc-800">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">Alterar plano</p>
                          </div>
                          {PLANS.map((plan) => (
                            <button key={plan} onClick={() => update(t.id, { plan })}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800 ${plan === t.plan ? "font-semibold text-gray-700 dark:text-gray-400" : "text-gray-700 dark:text-zinc-300"}`}>
                              <CreditCard size={13} /> {plan} {plan === t.plan && "✓"}
                            </button>
                          ))}
                          <div className="border-t border-gray-100 dark:border-zinc-800">
                            <button onClick={() => update(t.id, { featured: !t.featured })}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${t.featured ? "text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20" : "text-gray-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}>
                              <Star size={13} className={t.featured ? "fill-yellow-400 text-yellow-400" : ""} />
                              {t.featured ? "Remover destaque" : "Marcar destaque"}
                            </button>
                            <button onClick={() => update(t.id, { status: t.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" })}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${t.status === "ACTIVE" ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" : "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"}`}>
                              {t.status === "ACTIVE" ? <Ban size={13} /> : <CheckCircle size={13} />}
                              {t.status === "ACTIVE" ? "Suspender" : "Reativar"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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
