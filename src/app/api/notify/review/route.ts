import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReviewNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const Schema = z.object({
  reviewId: z.string().uuid("reviewId inválido"),
});

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const rl = rateLimit(`notify-review:${ip}`, { limit: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Muitas requisições." }, { status: 429 });
    }

    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Busca a avaliação real no banco — nunca confia em campos do body,
    // só no id de uma review que realmente foi inserida.
    const { data: review } = await supabase
      .from("reviews")
      .select("tenant_id, rating, reviewer_name, comment")
      .eq("id", parsed.data.reviewId)
      .maybeSingle();

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("name, slug, owner_id")
      .eq("id", review.tenant_id)
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

    const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

    await Promise.all([
      sendReviewNotification({
        to: profile.email,
        professionalName: tenant.name,
        reviewerName: review.reviewer_name ?? "Anônimo",
        rating: review.rating,
        comment: review.comment,
        slug: tenant.slug,
      }),
      supabase.from("notifications").insert({
        tenant_id: review.tenant_id,
        type: "review",
        title: `Nova avaliação ${stars} de ${review.reviewer_name ?? "Anônimo"}`,
        body: review.comment ? review.comment.slice(0, 120) : `${review.rating}/5 estrelas`,
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
