import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAI, AI_MODEL } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Não autenticado", { status: 401 });

  const body = await request.json();
  const { name, areas, city, state, years_experience, education, crea } = body;

  const areasText = (areas as string[] | undefined)?.join(", ") ?? "Engenharia";
  const locationText = [city, state].filter(Boolean).join(", ");

  const prompt = `Você é um assistente de marketing para engenheiros e profissionais da construção civil brasileira.

Escreva uma bio profissional atraente e autêntica em português para o seguinte perfil:

- Nome: ${name ?? "Profissional"}
- Áreas de atuação: ${areasText}
- Localização: ${locationText || "Brasil"}
${years_experience ? `- Anos de experiência: ${years_experience} anos` : ""}
${education ? `- Formação: ${education}` : ""}
${crea ? `- Registro: ${crea}` : ""}

Instruções:
- Escreva em primeira pessoa, tom profissional mas acessível
- Entre 80 e 150 palavras
- Destaque a experiência, especialidade e o diferencial do profissional
- Termine com uma chamada sutil para contato ou parceria
- NÃO use emojis, NÃO use asteriscos para negrito, apenas texto corrido
- NÃO inclua cabeçalho nem título, apenas a bio diretamente`;

  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: AI_MODEL });
    const result = await model.generateContentStream(prompt);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[generate-bio] Gemini error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
