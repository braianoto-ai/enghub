import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { geminiStream } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { messages, tenantId, area } = body as {
    messages: { role: "user" | "assistant"; content: string }[];
    tenantId: string;
    area?: string;
  };
  if (!messages?.length || !tenantId) return new Response("Parâmetros inválidos", { status: 400 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("professional_profiles")
    .select("name, areas, city, state")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  const profName = profile?.name ?? "profissional";
  const profAreas = (profile?.areas as string[] | null)?.join(", ") ?? area ?? "engenharia";
  const location = [profile?.city, profile?.state].filter(Boolean).join(", ");

  const system = `Você é um assistente de orçamento da EngHub ajudando o cliente a descrever seu projeto para ${profName}, especialista em ${profAreas}${location ? ` em ${location}` : ""}. Faça no máximo 3 perguntas por resposta. Seja objetivo. Não faça orçamentos de valores.`;

  // Monta historico + ultima mensagem como prompt único
  const history = messages.slice(0, -1).map((m) =>
    `${m.role === "user" ? "Cliente" : "Assistente"}: ${m.content}`
  ).join("\n");
  const last = messages[messages.length - 1].content;
  const prompt = history ? `${history}\nCliente: ${last}\nAssistente:` : last;

  try {
    const stream = await geminiStream(prompt, system);
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[quote-assistant]", err);
    return new Response(String(err), { status: 500 });
  }
}
