"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Newspaper, RefreshCw } from "lucide-react";
import { NewsArticleCard } from "@/components/news-article-card";

type NewsCategory = "ALL" | "ENGINEERING" | "ARCHITECTURE" | "NORMS" | "TECHNOLOGY";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  image_url: string | null;
  published_at: string;
  category: Exclude<NewsCategory, "ALL">;
  news_sources: { name: string; url: string };
}

const CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "ENGINEERING", label: "Engenharia" },
  { value: "ARCHITECTURE", label: "Arquitetura" },
  { value: "NORMS", label: "Normas" },
  { value: "TECHNOLOGY", label: "Tecnologia / BIM" },
];

export function NewsClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<NewsCategory>("ALL");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Debounce de 400ms no campo de busca
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Reset paginação ao mudar filtros
  useEffect(() => {
    setPage(1);
    setArticles([]);
  }, [category, debouncedQuery]);

  const fetchArticles = useCallback(async (reset: boolean) => {
    setLoading(true);
    const currentPage = reset ? 1 : page;
    const params = new URLSearchParams({
      page: String(currentPage),
      ...(category !== "ALL" && { category }),
      ...(debouncedQuery && { q: debouncedQuery }),
    });

    try {
      const res = await fetch(`/api/noticias?${params}`);
      const data = await res.json();
      const newArticles: Article[] = data.articles ?? [];
      setArticles((prev) => (reset ? newArticles : [...prev, ...newArticles]));
      setHasMore(newArticles.length === 24);
    } finally {
      setLoading(false);
    }
  }, [category, debouncedQuery, page]);

  useEffect(() => {
    fetchArticles(page === 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, debouncedQuery, page]);

  const loadMore = () => setPage((p) => p + 1);

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Categorias */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === cat.value
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Busca */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar notícias..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-8 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-600"
          />
        </div>
      </div>

      {/* Grid de artigos */}
      <div className="mt-6">
        {loading && articles.length === 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800" style={{ height: 300 }} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <Newspaper size={40} className="text-zinc-300 dark:text-zinc-600" />
            <p className="text-zinc-500 dark:text-zinc-400">
              Nenhuma notícia encontrada.
              {articles.length === 0 && !loading && " Tente executar a ingestão de feeds."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {articles.map((article) => (
              <NewsArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Carregar mais */}
        {hasMore && !loading && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={loadMore}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <RefreshCw size={14} />
              Carregar mais
            </button>
          </div>
        )}

        {loading && articles.length > 0 && (
          <div className="mt-6 flex justify-center">
            <RefreshCw size={18} className="animate-spin text-zinc-400" />
          </div>
        )}
      </div>
    </div>
  );
}
