"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Circle } from "lucide-react";

export type AvailabilityStatus = "available" | "consulting" | "unavailable";

const OPTIONS: {
  value: AvailabilityStatus;
  label: string;
  description: string;
  dot: string;
  badge: string;
}[] = [
  {
    value: "available",
    label: "Disponível para projetos",
    description: "Aceitando novos projetos",
    dot: "bg-green-500",
    badge: "border-green-200 bg-green-50 text-green-700 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-400",
  },
  {
    value: "consulting",
    label: "Aberto a consultas",
    description: "Disponível para consultas pontuais",
    dot: "bg-amber-400",
    badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-400",
  },
  {
    value: "unavailable",
    label: "Ocupado",
    description: "Sem disponibilidade no momento",
    dot: "bg-zinc-400",
    badge: "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-400",
  },
];

interface AvailabilitySwitcherProps {
  tenantId: string;
  initial: AvailabilityStatus;
  compact?: boolean;
}

export function AvailabilitySwitcher({
  tenantId,
  initial,
  compact = false,
}: AvailabilitySwitcherProps) {
  const [current, setCurrent] = useState<AvailabilityStatus>(initial);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const selected = OPTIONS.find((o) => o.value === current)!;

  async function update(value: AvailabilityStatus) {
    setSaving(true);
    setOpen(false);
    const supabase = createClient();
    await supabase
      .from("professional_profiles")
      .update({ availability: value })
      .eq("tenant_id", tenantId);
    setCurrent(value);
    setSaving(false);
  }

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={saving}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${selected.badge}`}
        >
          <span className={`h-2 w-2 rounded-full ${selected.dot} ${saving ? "animate-pulse" : ""}`} />
          {saving ? "Salvando..." : selected.label}
          <svg className="h-3 w-3 opacity-60" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-8 z-20 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update(opt.value)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 ${current === opt.value ? "bg-zinc-50 dark:bg-zinc-800" : ""}`}
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${opt.dot}`} />
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{opt.label}</p>
                    <p className="text-xs text-zinc-500">{opt.description}</p>
                  </div>
                  {current === opt.value && (
                    <svg className="ml-auto h-4 w-4 shrink-0 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Versão card completa (para a página de perfil)
  return (
    <div className="space-y-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => update(opt.value)}
          disabled={saving}
          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
            current === opt.value
              ? `${opt.badge} border-current ring-1 ring-current/30`
              : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/30 dark:hover:border-zinc-600"
          }`}
        >
          <span className={`h-3 w-3 shrink-0 rounded-full ${opt.dot} ${saving && current === opt.value ? "animate-pulse" : ""}`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${current === opt.value ? "" : "text-zinc-900 dark:text-zinc-100"}`}>
              {opt.label}
            </p>
            <p className={`text-xs ${current === opt.value ? "opacity-70" : "text-zinc-500"}`}>
              {opt.description}
            </p>
          </div>
          {current === opt.value && (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}

// Badge só para exibição (perfil público)
export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  const opt = OPTIONS.find((o) => o.value === status);
  if (!opt || status === "unavailable") return null;
  return (
    <span className={`flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium ${opt.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${opt.dot}`} />
      {opt.label}
    </span>
  );
}
