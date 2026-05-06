"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/buscar?q=${encodeURIComponent(q)}` : "/buscar");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-xl overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md focus-within:ring-2 focus-within:ring-white/40"
    >
      <div className="flex flex-1 items-center gap-3 px-5">
        <Search size={18} className="shrink-0 text-slate-300" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome, cidade ou especialidade..."
          className="w-full bg-transparent py-4 text-sm text-white placeholder:text-slate-400 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="m-1.5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
      >
        Buscar
      </button>
    </form>
  );
}
