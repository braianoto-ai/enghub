import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAI, AI_MODEL } from "@/lib/ai";

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId");
  if (!tenantId) return NextResponse.json({ error: "tenantId obrigatório" }, { status: 400 });

  // Auth: accept both logged-in user (dashboard) and public profile page
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: reviews } = await admin
    .from("reviews")
    .select("rating, comment")
    .eq("tenant_id", tenantId)
    .eq("visible", true)
    .not("comment", "is", null)
    .order("created_at", { ascending: false })
    .limit(30);

  if (!reviews || reviews.length < 3) {
    return NextResponse.json({ summary: null });
  }

  const reviewsText = reviews
    .filter((r) => r.comment)
    .map((r) => `[${r.rating}★] ${r.comment}`)
    .join("\n");

  const prompt = `Analise as seguintes avaliações de um profissional de engenharia e escreva um resumo conciso em português (máx. 2 frases) destacando os pontos mais elogiados pelos clientes. Seja específico e evite generalizações vagas.

Avaliações:
${reviewsText}

Responda APENAS com o resumo, sem introdução, sem aspas, sem título.`;

  const ai = getAI();
  const message = await ai.messages.create({
    model: AI_MODEL,
    max_tokens: 150,
    messages: [{ role: "user", content: prompt }],
  });

  const summary = message.content[0].type === "text" ? message.content[0].text.trim() : null;

  return NextResponse.json({ summary });
}
