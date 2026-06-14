import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAI, AI_MODEL } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Não autenticado", { status: 401 });

  const body = await request.json();
  const { name, areas, city, state, years_experience, education, crea, services } = body;

  const areasText = (areas as string[] | undefined)?.join(", ") ?? "Engenharia";
  const locationText = [city, state].filter(Boolean).join(", ");
  const servicesText = (services as string[] | undefined)?.slice(0, 5).join(", ");

  const prompt = `Você é um assistente de marketing para engenheiros e profissionais da construção civil brasileira.

Escreva uma bio profissional atraente e autêntica em português para o seguinte perfil:

- Nome: ${name ?? "Profissional"}
- Áreas de atuação: ${areasText}
- Localização: ${locationText || "Brasil"}
${years_experience ? `- Anos de experiência: ${years_experience} anos` : ""}
${education ? `- Formação: ${education}` : ""}
${crea ? `- Registro: ${crea}` : ""}
${servicesText ? `- Principais serviços: ${servicesText}` : ""}

Instruções:
- Escreva em primeira pessoa, tom profissional mas acessível
- Entre 80 e 150 palavras
- Destaque a experiência, especialidade e o diferencial do profissional
- Termine com uma chamada sutil para contato ou parceria
- NÃO use emojis, NÃO use asteriscos para negrito, apenas texto corrido
- NÃO inclua cabeçalho nem título, apenas a bio diretamente`;

  const ai = getAI();

  const stream = await ai.messages.stream({
    model: AI_MODEL,
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
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
