import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts, getPost, formatDate } from "@/lib/blog";
import { Clock, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

// Renderiza markdown simples (## heading, **bold**, lista com -)
function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="mt-10 mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="mt-6 mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("1. ") || line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].match(/^\d+\. /))) {
        items.push(lines[i].replace(/^- /, "").replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="mb-4 space-y-2 pl-5">
          {items.map((item, j) => (
            <li key={j} className="list-disc text-zinc-600 dark:text-zinc-400">
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.trim() === "") {
      // skip empty
    } else {
      elements.push(
        <p key={i} className="mb-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
          <InlineMarkdown text={line} />
        </p>
      );
    }
    i++;
  }

  return elements;
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-100">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const categoryColors: Record<string, string> = {
  Carreira: "bg-gray-200 text-gray-800 dark:bg-gray-700/40 dark:text-gray-300",
  Negócios: "bg-gray-200 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300",
  Regulamentação: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Marketing: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const others = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header do post */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-12 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft size={15} />
            Voltar ao blog
          </Link>

          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[post.category] ?? "bg-zinc-100 text-zinc-600"}`}>
            {post.category}
          </span>

          <h1 className="mt-4 text-4xl font-bold leading-tight text-zinc-900 dark:text-zinc-100">
            {post.title}
          </h1>

          <p className="mt-3 text-lg text-zinc-500 dark:text-zinc-400">
            {post.excerpt}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-800 dark:bg-gray-700/40 dark:text-gray-300">
              {post.author.initials}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {post.author.name}
              </p>
              <p className="flex items-center gap-2 text-xs text-zinc-400">
                <span>{post.author.role}</span>
                <span>·</span>
                <Clock size={11} />
                <span>{post.readTime} min de leitura</span>
                <span>·</span>
                <span>{formatDate(post.publishedAt)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="mx-auto max-w-3xl px-4 py-12">
        <article className="prose-zinc">
          {renderContent(post.content)}
        </article>

        {/* CTA inline */}
        <div className="mt-12 rounded-2xl border border-gray-300 bg-gray-100 p-6 dark:border-gray-700/50 dark:bg-gray-800/20">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-700">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                Crie seu portfólio profissional grátis
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Junte-se a mais de 500 engenheiros que já têm presença digital no EngHub.
                Comece agora, sem cartão de crédito.
              </p>
              <Link href="/cadastro">
                <button className="mt-3 flex items-center gap-1.5 rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-600">
                  Criar meu perfil
                  <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Outros artigos */}
        {others.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Continue lendo
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {others.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
                  <div className="rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryColors[p.category] ?? "bg-zinc-100 text-zinc-600"}`}>
                      {p.category}
                    </span>
                    <h3 className="mt-3 text-sm font-bold leading-snug text-zinc-900 group-hover:text-gray-700 dark:text-zinc-100 dark:group-hover:text-gray-400 transition-colors">
                      {p.title}
                    </h3>
                    <p className="mt-2 flex items-center gap-1 text-xs text-zinc-400">
                      <Clock size={11} />
                      {p.readTime} min
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
