import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { geminiGenerate } from "@/lib/ai";

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId");
  if (!tenantId) return NextResponse.json({ error: "tenantId obrigatório" }, { status: 400 });

  const admin = createAdminClient();
  const { data: reviews } = await admin
    .from("reviews")
    .select("rating, comment")
    .eq("tenant_id", tenantId)
    .eq("visible", true)
    .not("comment", "is", null)
    .order("created_at", { ascending: false })
    .limit(30);

  if (!reviews || reviews.length < 3) return NextResponse.json({ summary: null });

  const reviewsText = reviews
    .filter((r) => r.comment)
    .map((r) => `[${r.rating}★] ${r.comment}`)
    .join("\n");

  const prompt = `Analise estas avaliações de um engenheiro e escreva 1-2 frases destacando os pontos mais elogiados. Seja específico. Só o resumo, sem título.\n\n${reviewsText}`;

  try {
    const summary = await geminiGenerate(prompt);
    return NextResponse.json({ summary: summary.trim() || null });
  } catch (err) {
    console.error("[review-summary]", err);
    return NextResponse.json({ summary: null });
  }
}
