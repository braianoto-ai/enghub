import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts, formatDate } from "@/lib/blog";
import { Clock, ArrowRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Dicas para Engenheiros",
  description:
    "Artigos sobre carreira, portfólio, precificação e marketing para engenheiros e arquitetos. Conteúdo gratuito do EngHub.",
};

const categoryColors: Record<string, string> = {
  Carreira: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Negócios: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Regulamentação: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Marketing: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

export default function BlogPage() {
  const sorted = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const [featured, ...rest] = sorted;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-violet-600">
            <BookOpen size={16} />
            Blog do EngHub
          </div>
          <h1 className="mt-2 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            Conteúdo para engenheiros crescerem
          </h1>
          <p className="mt-2 max-w-xl text-zinc-500 dark:text-zinc-400">
            Dicas práticas de carreira, portfólio, precificação e marketing para
            profissionais de engenharia e arquitetura.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Post em destaque */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block">
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Visual placeholder */}
                <div className="flex min-h-48 items-center justify-center bg-gradient-to-br from-zinc-950 via-violet-950/50 to-zinc-900 p-10 lg:min-h-64">
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/20 ring-1 ring-violet-500/30">
                      <BookOpen size={28} className="text-violet-400" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-violet-300">Artigo em destaque</p>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-8">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[featured.category] ?? "bg-zinc-100 text-zinc-600"}`}>
                    {featured.category}
                  </span>
                  <h2 className="mt-4 text-2xl font-bold text-zinc-900 group-hover:text-violet-600 dark:text-zinc-100 dark:group-hover:text-violet-400 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="mt-3 leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {featured.excerpt}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                        {featured.author.initials}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                          {featured.author.name}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-zinc-400">
                          <Clock size={11} />
                          {featured.readTime} min · {formatDate(featured.publishedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-violet-600 group-hover:gap-2 transition-all dark:text-violet-400">
                      Ler artigo
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Grid de posts */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                {/* Visual */}
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                  <BookOpen size={32} className="text-zinc-300 dark:text-zinc-600" />
                </div>

                {/* Conteúdo */}
                <div className="flex flex-1 flex-col p-6">
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[post.category] ?? "bg-zinc-100 text-zinc-600"}`}>
                    {post.category}
                  </span>
                  <h3 className="mt-3 flex-1 text-base font-bold leading-snug text-zinc-900 group-hover:text-violet-600 dark:text-zinc-100 dark:group-hover:text-violet-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                      {post.author.initials}
                    </div>
                    <span className="flex items-center gap-1 text-xs text-zinc-400">
                      <Clock size={10} />
                      {post.readTime} min · {formatDate(post.publishedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-violet-200 bg-violet-50 p-8 text-center dark:border-violet-800/50 dark:bg-violet-900/20">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
            Quer seu portfólio profissional?
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Crie seu perfil no EngHub e comece a atrair clientes hoje.
          </p>
          <Link href="/cadastro">
            <button className="mt-4 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500">
              Criar perfil grátis →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
