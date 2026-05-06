"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react";

interface Props {
  tenantId: string;
  status: string;
  verified: boolean;
  number: string | null;
  type: string | null;
  notes: string | null;
  existingCrea: string | null;
  existingCau: string | null;
}

export function VerificacaoClient({
  tenantId,
  status,
  verified,
  number,
  type,
  notes,
  existingCrea,
  existingCau,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [selectedType, setSelectedType] = useState<"CREA" | "CAU">(
    type === "CAU" ? "CAU" : "CREA"
  );
  const [numberInput, setNumberInput] = useState(
    number ?? (type === "CAU" ? existingCau : existingCrea) ?? ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!numberInput.trim()) return;
    setSubmitting(true);
    setSubmitError("");

    const { error } = await supabase
      .from("professional_profiles")
      .update({
        crea_cau_number: numberInput.trim(),
        crea_cau_type: selectedType,
        crea_cau_status: "PENDING",
        crea_cau_verified: false,
        crea_cau_notes: null,
        crea_cau_reviewed_at: null,
        // also sync to existing crea/cau fields
        ...(selectedType === "CREA" ? { crea: numberInput.trim() } : { cau: numberInput.trim() }),
      })
      .eq("tenant_id", tenantId);

    if (error) {
      setSubmitError("Erro ao enviar solicitação. Tente novamente.");
      setSubmitting(false);
      return;
    }

    // Send notification to admin (best-effort)
    await supabase.from("notifications").insert({
      tenant_id: tenantId,
      type: "system",
      title: "Solicitação de verificação enviada",
      body: `Seu ${selectedType} ${numberInput.trim()} foi enviado para análise. Aguarde a aprovação.`,
      href: "/dashboard/verificacao",
      read: false,
    });

    router.refresh();
    setSubmitting(false);
  }

  // ── APPROVED ────────────────────────────────────────────────
  if (verified || status === "APPROVED") {
    return (
      <div className="mt-6 space-y-4">
        <div className="flex items-start gap-4 rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-800/40 dark:bg-green-900/10">
          <ShieldCheck size={36} className="shrink-0 text-green-500" />
          <div>
            <h2 className="text-lg font-bold text-green-800 dark:text-green-400">Perfil verificado!</h2>
            <p className="mt-1 text-sm text-green-700 dark:text-green-500">
              Seu {type} <strong>{number}</strong> foi verificado com sucesso. O selo aparece no seu perfil público.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">O que o selo garante</h3>
          <ul className="space-y-2.5">
            {[
              "Aparece com destaque nos resultados de busca",
              "Badge de verificado visível no seu perfil",
              "Mais confiança para clientes em potencial",
              "Diferencial competitivo na plataforma",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 size={15} className="shrink-0 text-green-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // ── PENDING ─────────────────────────────────────────────────
  if (status === "PENDING") {
    return (
      <div className="mt-6 space-y-4">
        <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800/40 dark:bg-amber-900/10">
          <Clock size={36} className="shrink-0 text-amber-500" />
          <div>
            <h2 className="text-lg font-bold text-amber-800 dark:text-amber-400">Análise em andamento</h2>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
              Seu {type} <strong>{number}</strong> está sendo analisado pela equipe EngHub.
              Em geral o processo leva até 2 dias úteis.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <Info size={16} className="shrink-0" />
            Você receberá uma notificação assim que a análise for concluída.
          </div>
        </div>
      </div>
    );
  }

  // ── REJECTED ────────────────────────────────────────────────
  if (status === "REJECTED") {
    return (
      <div className="mt-6 space-y-4">
        <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800/40 dark:bg-red-900/10">
          <ShieldAlert size={36} className="shrink-0 text-red-500" />
          <div>
            <h2 className="text-lg font-bold text-red-800 dark:text-red-400">Verificação não aprovada</h2>
            {notes && (
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                <strong>Motivo:</strong> {notes}
              </p>
            )}
          </div>
        </div>

        {/* Re-submit form */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Enviar novamente</h3>
          <SubmitForm
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            numberInput={numberInput}
            setNumberInput={setNumberInput}
            submitting={submitting}
            submitError={submitError}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    );
  }

  // ── NONE (default form) ─────────────────────────────────────
  return (
    <div className="mt-6 space-y-4">
      {/* Info card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start gap-3">
          <Shield size={24} className="mt-0.5 shrink-0 text-gray-400" />
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Por que verificar?</h3>
            <ul className="mt-2 space-y-1.5">
              {[
                "Selo de verificado no perfil público",
                "Destaque nos resultados de busca",
                "Maior confiança de potenciais clientes",
                "Diferencial frente a perfis não verificados",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <CheckCircle2 size={14} className="shrink-0 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Submit form */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Solicitar verificação</h3>
        <SubmitForm
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          numberInput={numberInput}
          setNumberInput={setNumberInput}
          submitting={submitting}
          submitError={submitError}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

function SubmitForm({
  selectedType,
  setSelectedType,
  numberInput,
  setNumberInput,
  submitting,
  submitError,
  onSubmit,
}: {
  selectedType: "CREA" | "CAU";
  setSelectedType: (v: "CREA" | "CAU") => void;
  numberInput: string;
  setNumberInput: (v: string) => void;
  submitting: boolean;
  submitError: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Type selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Tipo de registro
        </label>
        <div className="flex gap-3">
          {(["CREA", "CAU"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedType(t)}
              className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition-all ${
                selectedType === t
                  ? "border-gray-500 bg-gray-700 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          {selectedType === "CREA"
            ? "Conselho Regional de Engenharia e Agronomia"
            : "Conselho de Arquitetura e Urbanismo"}
        </p>
      </div>

      {/* Number input */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Número do {selectedType}
        </label>
        <input
          type="text"
          value={numberInput}
          onChange={(e) => setNumberInput(e.target.value)}
          required
          placeholder={selectedType === "CREA" ? "Ex: 123456/SP" : "Ex: A-12345"}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
        <AlertCircle size={15} className="mt-0.5 shrink-0 text-zinc-400" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          A equipe EngHub verificará seu número junto ao {selectedType}.
          O processo leva até 2 dias úteis. Certifique-se de que o número está correto
          e seu registro está ativo.
        </p>
      </div>

      {submitError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <XCircle size={15} />
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !numberInput.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-600 disabled:opacity-60"
      >
        <ShieldCheck size={16} />
        {submitting ? "Enviando..." : "Solicitar verificação"}
      </button>
    </form>
  );
}
