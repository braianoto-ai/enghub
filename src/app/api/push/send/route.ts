import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:contato@enghub.com.br",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Internal only — check for secret or authenticated admin
    const authHeader = request.headers.get("authorization");
    const isInternal = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    if (!isInternal) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
    }

    const { tenantId, title, body, url, tag } = await request.json();

    if (!tenantId || !title || !body) {
      return NextResponse.json({ error: "Campos obrigatórios: tenantId, title, body" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: subscriptions } = await supabase
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
        // Remove expired subscriptions (410 Gone or 404)
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          await supabase
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
