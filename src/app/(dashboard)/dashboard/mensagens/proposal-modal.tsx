"use client";

import { useState } from "react";
import { X, FileText, Loader2, Download } from "lucide-react";

interface ProposalModalProps {
  conversationId: string;
  visitorName: string;
  onClose: () => void;
}

export function ProposalModal({ conversationId, visitorName, onClose }: ProposalModalProps) {
  const [form, setForm] = useState({
    title: "",
    scope: "",
    value: "",
    deadline: "",
    payment: "",
    validity: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleGenerate() {
    if (!form.title.trim() || !form.scope.trim()) {
      setError("Título e escopo são obrigatórios.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/pdf/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, ...form }),
      });
      if (!res.ok) throw new Error("Erro ao gerar PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proposta-${form.title.slice(0, 30).replace(/\s+/g, "-").toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch {
      setError("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-gray-700 dark:text-zinc-300" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-zinc-100">Criar Proposta</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">para {visitorName}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-4">

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Título do projeto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ex: Projeto estrutural residencial"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Escopo / Descrição dos serviços <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={form.scope}
              onChange={(e) => set("scope", e.target.value)}
              placeholder="Descreva detalhadamente o que está incluído na proposta..."
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Valor total (R$)
              </label>
              <input
                type="text"
                value={form.value}
                onChange={(e) => set("value", e.target.value)}
                placeholder="Ex: 5.000,00"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Prazo de entrega
              </label>
              <input
                type="text"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
                placeholder="Ex: 30 dias úteis"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Condições de pagamento
              </label>
              <input
                type="text"
                value={form.payment}
                onChange={(e) => set("payment", e.target.value)}
                placeholder="Ex: 50% entrada + 50% entrega"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                Validade da proposta
              </label>
              <input
                type="text"
                value={form.validity}
                onChange={(e) => set("validity", e.target.value)}
                placeholder="Ex: 15/07/2026"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-100 px-6 py-4 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-700 py-2.5 text-sm font-semibold text-white hover:bg-gray-600 disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {loading ? "Gerando..." : "Baixar Proposta PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
