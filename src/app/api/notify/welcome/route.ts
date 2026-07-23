import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const Schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  slug: z.string().min(1).max(200),
  hasTrial: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const rl = rateLimit(`notify-welcome:${ip}`, { limit: 5, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Muitas requisições." }, { status: 429 });
    }

    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, slug, hasTrial } = parsed.data;

    // Só envia se existir um cadastro real e recente com este e-mail —
    // impede usar esta rota como relay de e-mail para endereços arbitrários.
    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("created_at")
      .eq("email", email)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Cadastro não encontrado" }, { status: 404 });
    }

    const createdRecently = Date.now() - new Date(profile.created_at).getTime() < 10 * 60 * 1000;
    if (!createdRecently) {
      return NextResponse.json({ error: "Cadastro não é recente" }, { status: 403 });
    }

    await sendWelcomeEmail({ to: email, name, slug, hasTrial: !!hasTrial });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("notify/welcome error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
