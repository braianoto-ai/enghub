import { NextRequest } from "next/server";
import { getAI, AI_MODEL } from "@/lib/ai";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { messages, tenantId, area } = body as {
    messages: { role: "user" | "assistant"; content: string }[];
    tenantId: string;
    area?: string;
  };

  if (!messages?.length || !tenantId) {
    return new Response("Parâmetros inválidos", { status: 400 });
  }

  // Fetch professional context
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("professional_profiles")
    .select("name, title, areas, city, state")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  const profName = profile?.name ?? "profissional";
  const profAreas = (profile?.areas as string[] | null)?.join(", ") ?? area ?? "engenharia";
  const location = [profile?.city, profile?.state].filter(Boolean).join(", ");

  const systemPrompt = `Você é um assistente de orçamento da plataforma EngHub, ajudando um cliente a descrever seu projeto para ${profName}, especialista em ${profAreas}${location ? ` em ${location}` : ""}.

Seu papel:
- Ajudar o cliente a detalhar bem o projeto (escopo, localização, prazo, orçamento estimado)
- Fazer perguntas específicas e relevantes para a área de engenharia
- Ser objetivo e amigável, sem enrolação
- Responder em português brasileiro
- Máximo de 3 perguntas por resposta
- Se o cliente já deu detalhes suficientes, confirme e incentive-o a enviar o orçamento

NÃO faça orçamentos de valores, pois isso é responsabilidade do profissional.`;

  const ai = getAI();
  const stream = await ai.messages.stream({
    model: AI_MODEL,
    max_tokens: 300,
    system: systemPrompt,
    messages: messages.slice(-10),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
