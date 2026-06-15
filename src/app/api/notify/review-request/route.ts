import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReviewRequestEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { conversationId } = await req.json();
    if (!conversationId) return NextResponse.json({ error: "conversationId obrigatório" }, { status: 400 });

    const admin = createAdminClient();

    const { data: conv } = await admin
      .from("conversations")
      .select("visitor_name, visitor_email, tenant_id")
      .eq("id", conversationId)
      .maybeSingle();

    if (!conv) return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });

    const { data: tenant } = await admin
      .from("tenants")
      .select("name, slug, owner_id")
      .eq("id", conv.tenant_id)
      .maybeSingle();

    if (!tenant || tenant.owner_id !== user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    await sendReviewRequestEmail({
      to: conv.visitor_email,
      visitorName: conv.visitor_name,
      professionalName: tenant.name,
      professionalSlug: tenant.slug,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify/review-request]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
