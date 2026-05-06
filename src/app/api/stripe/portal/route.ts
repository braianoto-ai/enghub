import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: tenant } = await supabase
    .from("tenants")
    .select("stripe_customer_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tenant?.stripe_customer_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enghub-eight.vercel.app";

  const session = await stripe.billingPortal.sessions.create({
    customer: tenant.stripe_customer_id as string,
    return_url: `${siteUrl}/dashboard/plano`,
  });

  return NextResponse.json({ url: session.url });
}
