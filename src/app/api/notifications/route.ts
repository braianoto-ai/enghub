import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

// GET — lista notificações do usuário logado (paginado por offset)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const offset = Math.max(0, parseInt(request.nextUrl.searchParams.get("offset") ?? "0", 10));

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tenant) return NextResponse.json({ notifications: [], unread: 0, hasMore: false });

  const [{ data: notifications }, { count: unread }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, type, title, body, href, read, created_at")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenant.id)
      .eq("read", false),
  ]);

  return NextResponse.json({
    notifications: notifications ?? [],
    unread: unread ?? 0,
    hasMore: (notifications?.length ?? 0) === PAGE_SIZE,
  });
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
