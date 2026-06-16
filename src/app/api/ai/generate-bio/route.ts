import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { geminiStream } from "@/lib/ai";

const schema = z.object({
  name: z.string().max(120).optional(),
  areas: z.array(z.string().max(60)).max(10).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(40).optional(),
  years_experience: z.number().int().min(0).max(60).optional(),
  education: z.string().max(200).optional(),
  crea: z.string().max(40).optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Não autenticado", { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return new Response("Dados inválidos", { status: 400 });
  const { name, areas, city, state, years_experience, education, crea } = parsed.data;

  const areasText = (areas as string[] | undefined)?.join(", ") ?? "Engenharia";
  const locationText = [city, state].filter(Boolean).join(", ");

  // Busca serviços cadastrados para enriquecer a bio
  const admin = createAdminClient();
  const { data: tenant } = await admin
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  let servicesText = "";
  if (tenant?.id) {
    const { data: services } = await admin
      .from("services")
      .select("title, description")
      .eq("tenant_id", tenant.id)
      .eq("is_active", true)
      .limit(8);
    if (services?.length) {
      servicesText = services
        .map((s) => `• ${s.title}${s.description ? `: ${s.description}` : ""}`)
        .join("\n");
    }
  }

  const prompt = `Você é um especialista em marketing pessoal para engenheiros. Escreva uma bio profissional completa e atraente em português para o seguinte engenheiro:

DADOS DO PROFISSIONAL:
- Nome: ${name ?? "Profissional"}
- Especialidades/Áreas: ${areasText}
- Localização: ${locationText || "Brasil"}
${years_experience ? `- Anos de experiência: ${years_experience} anos` : ""}
${education ? `- Formação acadêmica: ${education}` : ""}
${crea ? `- Registro profissional: ${crea}` : ""}
${servicesText ? `\nSERVIÇOS OFERECIDOS:\n${servicesText}` : ""}

INSTRUÇÕES:
- Escreva em primeira pessoa (eu, meu, minha)
- Tom profissional, confiante e acessível — que transmita credibilidade e aproxime o cliente
- Mencione as especialidades e os principais serviços oferecidos de forma natural
- Destaque a experiência e o diferencial do profissional
- Se tiver serviços listados, integre-os organicamente ao texto sem listar mecanicamente
- 180 a 250 palavras
- Sem emojis, sem asteriscos, sem título, sem "Bio:", sem "Apresentação:" — comece direto com a bio
- Termine com uma frase de chamada para ação sutil (ex: "Entre em contato e vamos conversar sobre seu projeto.")`;

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
