import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const cronHeader = request.headers.get("authorization");
  const manualHeader = request.headers.get("x-cron-secret");
  return (
    cronHeader === `Bearer ${process.env.CRON_SECRET}` ||
    manualHeader === process.env.CRON_SECRET
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

async function generateDigest(articles: { title: string; excerpt: string; category: string; source: string }[]) {
  const articleList = articles
    .map((a, i) => `${i + 1}. [${a.category}] ${a.title} (${a.source})\n   ${a.excerpt}`)
    .join("\n\n");

  const prompt = `Você é o editor da EngHub, plataforma brasileira de marketplace de engenheiros. Escreva um digest semanal de engenharia em português do Brasil, editorial e informativo, baseado nos artigos da semana abaixo.

ARTIGOS DA SEMANA:
${articleList}

INSTRUÇÕES:
- Escreva entre 700 e 900 palavras
- Tom editorial, não é uma lista — é um texto corrido com análise
- Organize em 3 a 4 seções com títulos ##
- Cubra diferentes áreas: civil, elétrica, mecânica, tecnologia, etc (quando disponíveis)
- Mencione tendências e o que os engenheiros brasileiros devem acompanhar
- Use markdown simples: ## para seções, **negrito** para termos importantes, - para listas quando necessário
- NÃO mencione fontes específicas pelo nome — resuma as informações
- Termine com um parágrafo de perspectiva para o profissional de engenharia brasileiro
- Responda APENAS com um JSON no formato:
{
  "title": "título do digest (máx 80 chars)",
  "excerpt": "resumo de 1 frase (máx 160 chars)",
  "content": "conteúdo completo em markdown"
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Resposta inválida do Gemini");

  return JSON.parse(jsonMatch[0]) as { title: string; excerpt: string; content: string };
}

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}

async function handler(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Busca os melhores artigos da última semana (PT primeiro, depois EN)
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: articles, error } = await supabase
    .from("news_articles")
    .select("title, excerpt, category, language, news_sources!inner(name)")
    .gte("published_at", since)
    .order("language", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(40);

  if (error || !articles?.length) {
    return NextResponse.json({ error: "Sem artigos suficientes", detail: error }, { status: 400 });
  }

  // Seleciona até 20 artigos variados por categoria
  const selected = Object.values(
    articles.reduce<Record<string, typeof articles>>((acc, a) => {
      if (!acc[a.category]) acc[a.category] = [];
      if (acc[a.category].length < 5) acc[a.category].push(a);
      return acc;
    }, {})
  ).flat().slice(0, 20);

  const input = selected.map((a) => ({
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    source: (a.news_sources as any)?.name ?? "Fonte desconhecida",
  }));

  const digest = await generateDigest(input);

  const date = new Date();
  const weekStr = `${date.getFullYear()}-w${Math.ceil(date.getDate() / 7).toString().padStart(2, "0")}`;
  const slug = `digest-semanal-${weekStr}-${slugify(digest.title).slice(0, 40)}`;
  const readTime = Math.ceil(digest.content.split(" ").length / 200);

  const { error: insertError } = await supabase.from("blog_posts").upsert(
    {
      slug,
      title: digest.title,
      excerpt: digest.excerpt,
      content: digest.content,
      category: "Digest Semanal",
      read_time: readTime,
      author_name: "EngHub Editorial",
      author_initials: "EH",
      author_role: "Inteligência Artificial + Curadoria EngHub",
      is_published: true,
      is_ai_generated: true,
    },
    { onConflict: "slug", ignoreDuplicates: false }
  );

  if (insertError) {
    return NextResponse.json({ error: "Erro ao salvar digest", detail: insertError }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug, title: digest.title, timestamp: new Date().toISOString() });
}
