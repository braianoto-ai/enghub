import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geminiStream } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Não autenticado", { status: 401 });

  const body = await request.json();
  const { name, areas, city, state, years_experience, education, crea } = body;

  const areasText = (areas as string[] | undefined)?.join(", ") ?? "Engenharia";
  const locationText = [city, state].filter(Boolean).join(", ");

  const prompt = `Escreva uma bio profissional atraente em português para este engenheiro:

- Nome: ${name ?? "Profissional"}
- Áreas: ${areasText}
- Localização: ${locationText || "Brasil"}
${years_experience ? `- Experiência: ${years_experience} anos` : ""}
${education ? `- Formação: ${education}` : ""}
${crea ? `- Registro: ${crea}` : ""}

Instruções: primeira pessoa, tom profissional mas acessível, 80-150 palavras, sem emojis, sem asteriscos, sem título — apenas a bio diretamente.`;

  try {
    const stream = await geminiStream(prompt);
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("[generate-bio]", err);
    return new Response(String(err), { status: 500 });
  }
}
