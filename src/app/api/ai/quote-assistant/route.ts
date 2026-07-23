import { NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { geminiStream } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";

const Schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(1000),
      })
    )
    .min(1)
    .max(20),
  tenantId: z.string().uuid(),
  area: z.string().max(60).optional(),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const rl = rateLimit(`quote-assistant:${ip}`, { limit: 20, windowMs: 5 * 60_000 });
  if (!rl.allowed) {
    return new Response("Muitas requisições. Tente novamente em instantes.", { status: 429 });
  }

  const parsed = Schema.safeParse(await request.json());
  if (!parsed.success) return new Response("Parâmetros inválidos", { status: 400 });
  const { messages, tenantId, area } = parsed.data;

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
