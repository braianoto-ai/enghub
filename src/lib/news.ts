// eslint-disable-next-line @typescript-eslint/no-require-imports
const Parser = require("rss-parser");
import { createAdminClient } from "@/lib/supabase/admin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parser = new Parser({
  headers: {
    "User-Agent": "EngHubBot/1.0 (+https://enghub.com.br/noticias)",
  },
  timeout: 10000,
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
      ["enclosure", "enclosure"],
    ],
  },
});

type NewsCategory = "ENGINEERING" | "ARCHITECTURE" | "NORMS" | "TECHNOLOGY";

interface NewsSource {
  id: string;
  name: string;
  rss_url: string;
  category: NewsCategory;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImageUrl(item: Record<string, any>): string | null {
  // Tenta media:content, media:thumbnail, enclosure (ordem de preferência)
  if (item.mediaContent?.$?.url) return item.mediaContent.$.url as string;
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url as string;
  if (item.enclosure?.url && item.enclosure?.type?.startsWith("image/")) return item.enclosure.url as string;

  // Fallback: busca primeira <img> no conteúdo do feed (sem armazenar HTML)
  const content = (item["content:encoded"] as string) || (item.content as string) || "";
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

function truncateExcerpt(text: string, max = 300): string {
  const clean = text.replace(/<[^>]+>/g, "").trim();
  return clean.length <= max ? clean : clean.slice(0, max).trimEnd() + "…";
}

export async function ingestSource(source: NewsSource): Promise<{ inserted: number; skipped: number }> {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let feed: any;
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 15000)
    );
    feed = await Promise.race([parser.parseURL(source.rss_url), timeout]);
  } catch (err) {
    console.error(`[news] Falha ao buscar feed: ${source.rss_url}`, err);
    return { inserted: 0, skipped: 0 };
  }

  let inserted = 0;
  let skipped = 0;

  for (const item of feed.items.slice(0, 20)) {
    if (!item.link || !item.title) { skipped++; continue; }

    const excerpt = truncateExcerpt(
      (item["content:encoded"] as string) || item.contentSnippet || item.content || ""
    );
    const imageUrl = extractImageUrl(item);
    const publishedAt = item.isoDate || item.pubDate
      ? new Date(item.isoDate || item.pubDate!).toISOString()
      : new Date().toISOString();

    const { error } = await supabase.from("news_articles").upsert(
      {
        title: item.title.trim(),
        excerpt: excerpt || item.title.trim(),
        url: item.link,
        image_url: imageUrl,
        published_at: publishedAt,
        source_id: source.id,
        category: source.category,
      },
      { onConflict: "url", ignoreDuplicates: true }
    );

    if (error) { skipped++; } else { inserted++; }
  }

  return { inserted, skipped };
}

export async function ingestAllSources(): Promise<{ total_inserted: number; total_skipped: number }> {
  const supabase = createAdminClient();

  const { data: sources, error } = await supabase
    .from("news_sources")
    .select("id, name, rss_url, category")
    .eq("active", true);

  if (error || !sources) {
    console.error("[news] Erro ao buscar fontes:", JSON.stringify(error));
    return { total_inserted: 0, total_skipped: 0 };
  }

  let total_inserted = 0;
  let total_skipped = 0;

  for (const source of sources as NewsSource[]) {
    const result = await ingestSource(source);
    total_inserted += result.inserted;
    total_skipped += result.skipped;
    console.log(`[news] ${source.name}: +${result.inserted} inseridos, ${result.skipped} ignorados`);
  }

  return { total_inserted, total_skipped };
}

export type { NewsCategory };
