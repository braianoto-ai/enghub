import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendReviewNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { tenantId, reviewerName, rating, comment } = await req.json();

    if (!tenantId || !reviewerName || !rating) {
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

    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

    await Promise.all([
      sendReviewNotification({
        to: profile.email,
        professionalName: tenant.name,
        reviewerName,
        rating,
        comment,
        slug: tenant.slug,
      }),
      supabase.from("notifications").insert({
        tenant_id: tenantId,
        type: "review",
        title: `Nova avaliação ${stars} de ${reviewerName}`,
        body: comment ? comment.slice(0, 120) : `${rating}/5 estrelas`,
        href: "/dashboard/avaliacoes",
        read: false,
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("notify/review error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
