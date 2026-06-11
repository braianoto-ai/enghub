import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import webpush from "web-push";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
  }

  webpush.setVapidDetails("mailto:contato@enghub.com.br", vapidPublic, vapidPrivate);

  try {
    const authHeader = request.headers.get("authorization");
    const isInternal = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    const { tenantId, title, body, url, tag } = await request.json();

    if (!tenantId || !title || !body) {
      return NextResponse.json(
        { error: "Campos obrigatórios: tenantId, title, body" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    if (!isInternal) {
      // Verifica autenticação
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }

      // Verifica que o usuário é dono do tenant (corrige IDOR)
      const { data: ownerCheck } = await supabase
        .from("tenants")
        .select("id")
        .eq("id", tenantId)
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!ownerCheck) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    }

    // Admin client para buscar subscriptions sem RLS (service role)
    const adminSupabase = createAdminClient();
    const { data: subscriptions } = await adminSupabase
      .from("push_subscriptions")
      .select("endpoint, keys_p256dh, keys_auth")
      .eq("tenant_id", tenantId);

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0, message: "Nenhuma subscription encontrada" });
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || "/dashboard",
      tag: tag || "enghub-notification",
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys_p256dh,
              auth: sub.keys_auth,
            },
          },
          payload
        );
        sent++;
      } catch (err: unknown) {
        failed++;
        // Remove subscriptions expiradas (410 Gone ou 404)
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          await adminSupabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
        }
      }
    }

    return NextResponse.json({ sent, failed });
  } catch (err) {
    console.error("Push send error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
