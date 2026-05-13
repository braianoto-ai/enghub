import Image from "next/image";
import { ExternalLink, Clock, Building2, HardHat, FileText, Cpu } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type NewsCategory = "ENGINEERING" | "ARCHITECTURE" | "NORMS" | "TECHNOLOGY";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  image_url: string | null;
  published_at: string;
  category: NewsCategory;
  news_sources: {
    name: string;
    url: string;
  };
}

const categoryConfig: Record<NewsCategory, { label: string; icon: React.ReactNode; className: string }> = {
  ENGINEERING: {
    label: "Engenharia",
    icon: <HardHat size={11} />,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  ARCHITECTURE: {
    label: "Arquitetura",
    icon: <Building2 size={11} />,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  NORMS: {
    label: "Normas",
    icon: <FileText size={11} />,
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
  TECHNOLOGY: {
    label: "Tecnologia",
    icon: <Cpu size={11} />,
    className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
};

export function NewsArticleCard({ article }: { article: NewsArticle }) {
  const cat = categoryConfig[article.category];
  const timeAgo = formatDistanceToNow(new Date(article.published_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Thumbnail */}
      <div className="relative h-44 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {cat.icon && (
              <span className="text-zinc-300 dark:text-zinc-600">
                <Building2 size={40} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-4">
        {/* Badge categoria */}
        <span className={`flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cat.className}`}>
          {cat.icon}
          {cat.label}
        </span>

        {/* Título */}
        <h3 className="mt-2 line-clamp-2 flex-1 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-400 transition-colors">
          {article.title}
        </h3>

        {/* Trecho */}
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {article.excerpt}
        </p>

        {/* Rodapé */}
        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate max-w-[70%]">
            {article.news_sources.name}
          </span>
          <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
            <Clock size={10} />
            <span className="whitespace-nowrap">{timeAgo}</span>
            <ExternalLink size={10} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </a>
  );
}
