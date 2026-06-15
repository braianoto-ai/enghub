"use client";

import { useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";

export function ProfileLinkBar({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}/pt/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <a
        href={`/pt/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <ExternalLink size={14} />
        Ver perfil público
      </a>
      <button
        onClick={handleCopy}
        title="Copiar link do perfil"
        className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        {copied ? "Copiado!" : "Copiar link"}
      </button>
    </div>
  );
}
