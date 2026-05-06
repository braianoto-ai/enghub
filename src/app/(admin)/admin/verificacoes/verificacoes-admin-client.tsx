"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, ShieldAlert, Clock, ExternalLink, Check, X } from "lucide-react";
import Link from "next/link";

interface VerifRequest {
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  owner_name: string | null;
  owner_email: string | null;
  crea_cau_number: string | null;
  crea_cau_type: string | null;
  crea_cau_status: string;
  crea_cau_verified: boolean;
  crea_cau_notes: string | null;
  crea_cau_reviewed_at: string | null;
}

const statusConfig = {
  PENDING:  { label: "Pendente",  color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
  APPROVED: { label: "Aprovado",  color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: ShieldCheck },
  REJECTED: { label: "Rejeitado", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",   icon: ShieldAlert },
};

export function VerificacoesAdminClient({
  pending,
  reviewed,
}: {
  pending: VerifRequest[];
  reviewed: VerifRequest[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [actionId, setActionId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAction(tenantId: string, action: "approve" | "reject") {
    if (action === "reject" && !notes.trim()) return;
    setLoading(true);

    const updates =
      action === "approve"
        ? {
            crea_cau_status: "APPROVED",
            crea_cau_verified: true,
            crea_cau_notes: notes.trim() || null,
            crea_cau_reviewed_at: new Date().toISOString(),
          }
        : {
            crea_cau_status: "REJECTED",
            crea_cau_verified: false,
            crea_cau_notes: notes.trim(),
            crea_cau_reviewed_at: new Date().toISOString(),
          };

    await supabase
      .from("professional_profiles")
      .update(updates)
      .eq("tenant_id", tenantId);

    // Notify the professional
    const req = [...pending, ...reviewed].find((r) => r.tenant_id === tenantId);
    if (req) {
      await supabase.from("notifications").insert({
        tenant_id: tenantId,
        type: "system",
        title: action === "approve"
          ? `✅ ${req.crea_cau_type} verificado com sucesso!`
          : `❌ Verificação ${req.crea_cau_type} não aprovada`,
        body: action === "approve"
          ? `Seu ${req.crea_cau_type} ${req.crea_cau_number} foi verificado. O selo aparece no seu perfil.`
          : `Motivo: ${notes.trim()}`,
        href: "/dashboard/verificacao",
        read: false,
      });
    }

    setActionId(null);
    setNotes("");
    setActionType(null);
    setLoading(false);
    router.refresh();
  }

  function openAction(tenantId: string, type: "approve" | "reject") {
    setActionId(tenantId);
    setActionType(type);
    setNotes("");
  }

  return (
    <div className="space-y-8">
      {/* Pending */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
          Pendentes ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center dark:border-slate-700">
            <ShieldCheck size={32} className="mx-auto mb-2 text-gray-300 dark:text-slate-600" />
            <p className="text-sm text-gray-400 dark:text-slate-500">Nenhuma solicitação pendente</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800">
                  {["Profissional", "Registro", "Número", "Ações"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {pending.map((req) => (
                  <tr key={req.tenant_id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{req.tenant_name}</p>
                            <Link href={`/${req.tenant_slug}`} target="_blank" className="text-gray-400 hover:text-gray-700">
                              <ExternalLink size={11} />
                            </Link>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-slate-500">{req.owner_email ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-slate-800 dark:text-slate-300">
                        {req.crea_cau_type ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-mono text-sm text-gray-800 dark:text-slate-200">{req.crea_cau_number ?? "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      {actionId === req.tenant_id ? (
                        <div className="space-y-2">
                          {actionType === "reject" && (
                            <input
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Motivo da rejeição (obrigatório)"
                              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            />
                          )}
                          {actionType === "approve" && (
                            <input
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Observação (opcional)"
                              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            />
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(req.tenant_id, actionType!)}
                              disabled={loading || (actionType === "reject" && !notes.trim())}
                              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 ${
                                actionType === "approve"
                                  ? "bg-green-600 hover:bg-green-500"
                                  : "bg-red-600 hover:bg-red-500"
                              }`}
                            >
                              {loading ? "..." : actionType === "approve" ? <><Check size={12} /> Confirmar</> : <><X size={12} /> Rejeitar</>}
                            </button>
                            <button
                              onClick={() => { setActionId(null); setActionType(null); setNotes(""); }}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-400"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openAction(req.tenant_id, "approve")}
                            className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500"
                          >
                            <Check size={13} /> Aprovar
                          </button>
                          <button
                            onClick={() => openAction(req.tenant_id, "reject")}
                            className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <X size={13} /> Rejeitar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Revisados ({reviewed.length})
          </h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800">
                  {["Profissional", "Registro", "Número", "Status", "Data"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {reviewed.map((req) => {
                  const cfg = statusConfig[req.crea_cau_status as keyof typeof statusConfig] ?? statusConfig.PENDING;
                  const Icon = cfg.icon;
                  return (
                    <tr key={req.tenant_id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{req.tenant_name}</p>
                          <Link href={`/${req.tenant_slug}`} target="_blank" className="text-gray-400 hover:text-gray-700">
                            <ExternalLink size={11} />
                          </Link>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{req.owner_email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-slate-800 dark:text-slate-300">
                          {req.crea_cau_type ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-gray-700 dark:text-slate-300">
                        {req.crea_cau_number ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
                          <Icon size={11} />
                          {cfg.label}
                        </span>
                        {req.crea_cau_notes && (
                          <p className="mt-0.5 text-xs text-gray-400 dark:text-slate-500 max-w-[180px] truncate" title={req.crea_cau_notes}>
                            {req.crea_cau_notes}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                        {req.crea_cau_reviewed_at
                          ? new Date(req.crea_cau_reviewed_at).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
