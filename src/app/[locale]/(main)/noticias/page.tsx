import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { NewsClient } from "./news-client";

export const metadata: Metadata = {
  title: "Notícias — Engenharia & Arquitetura | EngHub",
  description:
    "Hub de notícias de engenharia civil, arquitetura, normas técnicas e tecnologia BIM. Conteúdo agregado das principais fontes do setor.",
};

export default function NoticiasPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-400">
            <Newspaper size={16} />
            Hub de Notícias
          </div>
          <h1 className="mt-2 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            Engenharia & Arquitetura
          </h1>
          <p className="mt-2 max-w-xl text-zinc-500 dark:text-zinc-400">
            Notícias das principais fontes do setor — projetos, inovações, normas e tecnologia.
            Todos os artigos linkam diretamente para a fonte original.
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        <NewsClient />
      </div>

      {/* Rodapé legal */}
      <div className="border-t border-zinc-100 px-4 py-6 text-center dark:border-zinc-800">
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          Todos os artigos são de propriedade de seus respectivos autores e publicações.
          O EngHub exibe apenas trechos dos feeds RSS públicos com link para a fonte original.{" "}
          <a href="/remocao-de-fonte" className="underline hover:text-zinc-600 dark:hover:text-zinc-400">
            Solicitar remoção de fonte
          </a>
        </p>
      </div>
    </div>
  );
}
