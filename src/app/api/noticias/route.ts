import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 24;
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  let query = supabase
    .from("news_articles")
    .select(`
      id, title, excerpt, url, image_url, published_at, category,
      news_sources!inner(name, url)
    `)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== "ALL") {
    query = query.eq("category", category);
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Erro ao buscar artigos" }, { status: 500 });
  }

  return NextResponse.json({ articles: data ?? [] });
}
