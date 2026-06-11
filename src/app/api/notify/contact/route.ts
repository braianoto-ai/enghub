import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendContactNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const ContactSchema = z.object({
  tenantId: z.string().uuid("tenantId inválido"),
  senderName: z.string().min(2, "Nome muito curto").max(100),
  senderEmail: z.string().email("E-mail inválido"),
  senderPhone: z.string().max(30).optional(),
  message: z.string().min(10, "Mensagem muito curta").max(2000),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 mensagens por IP por minuto
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const rl = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em instantes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { tenantId, senderName, senderEmail, senderPhone, message } = parsed.data;

    // Leitura pública: qualquer um pode buscar o tenant (necessário para visitantes)
    const supabase = await createClient();

    const { data: tenant } = await supabase
      .from("tenants")
      .select("name, slug, owner_id")
      .eq("id", tenantId)
      .maybeSingle();

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", tenant.owner_id)
      .maybeSingle();

    if (!profile?.email) {
      return NextResponse.json({ error: "Owner email not found" }, { status: 404 });
    }

    // Admin client para bypass de RLS no insert de notificações
    const adminSupabase = createAdminClient();

    await Promise.all([
      sendContactNotification({
        to: profile.email,
        professionalName: tenant.name,
        senderName,
        senderEmail,
        senderPhone,
        message,
        slug: tenant.slug,
      }),
      adminSupabase.from("notifications").insert({
        tenant_id: tenantId,
        type: "message",
        title: `Nova mensagem de ${senderName}`,
        body: message.slice(0, 120),
        href: "/dashboard/mensagens",
        read: false,
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("notify/contact error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
