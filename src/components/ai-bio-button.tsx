"use client";

import { useState, useRef } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface Props {
  getFormData: () => {
    name?: string;
    areas?: string[];
    city?: string;
    state?: string;
    years_experience?: number;
    education?: string;
    crea?: string;
    services?: string[];
  };
  onGenerated: (text: string) => void;
}

export function AiBioButton({ getFormData, onGenerated }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getFormData()),
      });
      if (!res.ok || !res.body) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        onGenerated(text);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
      {loading ? "Gerando..." : "Gerar com IA"}
    </button>
  );
}
