import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AvaliacoesClient } from "./avaliacoes-client";
import { getAI, AI_MODEL } from "@/lib/ai";

export default async function AvaliacoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tenant) redirect("/dashboard");

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, reviewer_name, reviewer_email, reply, reply_at")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  const list = reviews ?? [];
  const avgRating = list.length > 0
    ? list.reduce((sum, r) => sum + r.rating, 0) / list.length
    : 0;

  // AI summary (only when ≥3 reviews with comments)
  let aiSummary: string | null = null;
  const reviewsWithComments = list.filter((r) => r.comment);
  if (reviewsWithComments.length >= 3 && process.env.ANTHROPIC_API_KEY) {
    try {
      const ai = getAI();
      const reviewsText = reviewsWithComments
        .slice(0, 20)
        .map((r) => `[${r.rating}★] ${r.comment}`)
        .join("\n");
      const msg = await ai.messages.create({
        model: AI_MODEL,
        max_tokens: 150,
        messages: [{
          role: "user",
          content: `Analise as avaliações abaixo e escreva 1-2 frases destacando o que os clientes mais elogiam neste profissional. Seja específico. Responda só o resumo, sem título ou introdução.\n\n${reviewsText}`,
        }],
      });
      if (msg.content[0].type === "text") aiSummary = msg.content[0].text.trim();
    } catch {
      // silently skip if AI fails
    }
  }

  return (
    <AvaliacoesClient
      reviews={list}
      avgRating={avgRating}
      tenantId={tenant.id}
      aiSummary={aiSummary}
    />
  );
}
