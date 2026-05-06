"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface UpgradeButtonProps {
  plan: string;
  label?: string;
  className?: string;
}

export function UpgradeButton({ plan, label = "Assinar agora", className }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Erro ao iniciar checkout. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={className ?? "mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-700 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600 disabled:opacity-60"}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {loading ? "Aguarde..." : label}
    </button>
  );
}

export function ManageButton() {
  const [loading, setLoading] = useState(false);

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Erro ao abrir portal. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePortal}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border border-gray-400 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-60 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800/20"
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {loading ? "Aguarde..." : "Gerenciar assinatura"}
    </button>
  );
}
