import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendContactNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { tenantId, senderName, senderEmail, senderPhone, message } =
      await req.json();

    if (!tenantId || !senderName || !senderEmail || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

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
      supabase.from("notifications").insert({
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
