import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — lista notificações do usuário logado
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tenant) return NextResponse.json({ notifications: [], unread: 0 });

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, body, href, read, created_at")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const unread = (notifications ?? []).filter((n) => !n.read).length;

  return NextResponse.json({ notifications: notifications ?? [], unread });
}

// PATCH — marca notificações como lidas
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await req.json();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tenant) return NextResponse.json({ ok: false });

  if (ids && ids.length > 0) {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("tenant_id", tenant.id)
      .in("id", ids);
  } else {
    // marca todas
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("tenant_id", tenant.id)
      .eq("read", false);
  }

  return NextResponse.json({ ok: true });
}
