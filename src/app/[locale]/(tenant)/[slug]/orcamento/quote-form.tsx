"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, CheckCircle, Loader2, Send } from "lucide-react";
import { quoteFieldsByArea, defaultQuoteFields, type QuoteField } from "@/lib/quote-fields";
import { createClient } from "@/lib/supabase/client";
import { engineeringAreaLabels } from "@/lib/utils";

interface QuoteFormProps {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  areas: string[];
}

type Step = "area" | "details" | "contact" | "done";

export function QuoteForm({ tenantId, tenantName, tenantSlug, areas }: QuoteFormProps) {
  const supabase = createClient();

  // If professional has only one area, skip area selection
  const singleArea = areas.length === 1 ? areas[0] : null;

  const [step, setStep] = useState<Step>(singleArea ? "details" : "area");
  const [selectedArea, setSelectedArea] = useState<string>(singleArea ?? "");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const config = selectedArea
    ? (quoteFieldsByArea[selectedArea] ?? null)
    : null;
  const fields: QuoteField[] = config?.fields ?? defaultQuoteFields;

  function setField(id: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [id]: value }));
  }

  function validateDetails() {
    for (const f of fields) {
      if (f.required && !fieldValues[f.id]?.trim()) return false;
    }
    return true;
  }

  function validateContact() {
    return contact.name.trim() && contact.email.trim();
  }

  async function handleSubmit() {
    if (!validateContact()) {
      setError("Nome e e-mail são obrigatórios.");
      return;
    }
    setLoading(true);
    setError("");

    // Build a human-readable message from the structured fields
    const areaLabel = selectedArea ? (engineeringAreaLabels[selectedArea] ?? selectedArea) : "Geral";
    const lines = [`📋 Solicitação de orçamento — ${areaLabel}\n`];

    for (const f of fields) {
      const val = fieldValues[f.id];
      if (val) {
        lines.push(`• ${f.label}: ${val}${f.unit ? " " + f.unit : ""}`);
      }
    }

    const message = lines.join("\n");

    // Create conversation + first message
    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .insert({
        tenant_id: tenantId,
        visitor_name: contact.name.trim(),
        visitor_email: contact.email.trim(),
        visitor_phone: contact.phone.trim() || null,
      })
      .select("id")
      .single();

    if (convErr || !conv) {
      setError("Erro ao enviar. Tente novamente.");
      setLoading(false);
      return;
    }

    await supabase.from("messages").insert({
      conversation_id: conv.id,
      tenant_id: tenantId,
      sender: "visitor",
      content: message,
      read: false,
    });

    // Notification (fire and forget)
    void supabase.from("notifications").insert({
      tenant_id: tenantId,
      type: "message",
      title: `Novo orçamento de ${contact.name.trim()}`,
      body: `${areaLabel} — ${fieldValues["project_type"] ?? ""}`.slice(0, 120),
      href: "/dashboard/mensagens",
      read: false,
    });

    // Email notification (fire and forget)
    fetch("/api/notify/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        senderName: contact.name,
        senderEmail: contact.email,
        senderPhone: contact.phone || null,
        message,
      }),
    }).catch(() => {});

    setStep("done");
    setLoading(false);
  }

  // ── DONE ──
  if (step === "done") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Orçamento enviado!</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {tenantName} receberá sua solicitação e entrará em contato em breve.
          </p>
        </div>
        <button
          onClick={() => { setStep(singleArea ? "details" : "area"); setFieldValues({}); setContact({ name: "", email: "", phone: "" }); }}
          className="mt-2 text-sm text-gray-600 hover:underline dark:text-zinc-400"
        >
          Enviar outro orçamento
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {(singleArea ? ["details", "contact"] : ["area", "details", "contact"]).map((s, i, arr) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              step === s
                ? "bg-gray-700 text-white"
                : arr.indexOf(step) > i
                  ? "bg-green-500 text-white"
                  : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
            }`}>
              {arr.indexOf(step) > i ? "✓" : i + 1}
            </div>
            {i < arr.length - 1 && (
              <div className={`h-0.5 flex-1 rounded ${arr.indexOf(step) > i ? "bg-green-400" : "bg-zinc-200 dark:bg-zinc-700"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP: AREA ── */}
      {step === "area" && (
        <div>
          <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">Qual área você precisa?</h2>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">Selecione a especialidade para um formulário personalizado</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {areas.map((area) => {
              const cfg = quoteFieldsByArea[area];
              return (
                <button
                  key={area}
                  onClick={() => { setSelectedArea(area); setStep("details"); }}
                  className="flex flex-col items-start rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all hover:border-gray-400 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-500"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {engineeringAreaLabels[area] ?? area}
                  </span>
                  {cfg && (
                    <span className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{cfg.description}</span>
                  )}
                </button>
              );
            })}
            {/* Option for area not listed */}
            <button
              onClick={() => { setSelectedArea(""); setStep("details"); }}
              className="flex flex-col items-start rounded-xl border border-dashed border-zinc-300 bg-white p-4 text-left transition-all hover:border-gray-400 dark:border-zinc-600 dark:bg-zinc-800"
            >
              <span className="font-medium text-zinc-500 dark:text-zinc-400">Outra área / não sei</span>
              <span className="mt-0.5 text-xs text-zinc-400">Formulário geral</span>
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: DETAILS ── */}
      {step === "details" && (
        <div>
          <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
            {config ? config.label : "Detalhes do projeto"}
          </h2>
          <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
            Preencha os campos abaixo para receber uma proposta precisa
          </p>

          <div className="space-y-4">
            {fields.map((f) => (
              <div key={f.id}>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {f.label}
                  {f.required && <span className="ml-1 text-red-500">*</span>}
                  {f.unit && <span className="ml-1 text-xs text-zinc-400">({f.unit})</span>}
                </label>

                {f.type === "select" && (
                  <select
                    value={fieldValues[f.id] ?? ""}
                    onChange={(e) => setField(f.id, e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  >
                    <option value="">Selecione...</option>
                    {f.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {(f.type === "text" || f.type === "number") && (
                  <input
                    type={f.type}
                    value={fieldValues[f.id] ?? ""}
                    onChange={(e) => setField(f.id, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                )}

                {f.type === "textarea" && (
                  <textarea
                    rows={3}
                    value={fieldValues[f.id] ?? ""}
                    onChange={(e) => setField(f.id, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            {!singleArea && (
              <button
                onClick={() => setStep("area")}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <ChevronLeft size={15} /> Voltar
              </button>
            )}
            <button
              onClick={() => { if (validateDetails()) { setStep("contact"); setError(""); } else setError("Preencha os campos obrigatórios."); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-600"
            >
              Continuar <ChevronRight size={15} />
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      )}

      {/* ── STEP: CONTACT ── */}
      {step === "contact" && (
        <div>
          <h2 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">Seus dados de contato</h2>
          <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
            Para {tenantName.split(" ")[0]} entrar em contato com você
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contact.name}
                onChange={(e) => setContact({ ...contact, name: e.target.value })}
                placeholder="João Silva"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                placeholder="joao@email.com"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Telefone / WhatsApp <span className="text-xs text-zinc-400">(opcional)</span>
              </label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => { setStep("details"); setError(""); }}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <ChevronLeft size={15} /> Voltar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-600 disabled:opacity-60"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {loading ? "Enviando..." : "Enviar solicitação"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
