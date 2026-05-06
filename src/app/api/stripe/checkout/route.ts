import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLAN_PRICES } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  const price = PLAN_PRICES[plan];
  if (!price) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, stripe_customer_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  // Reuse or create Stripe customer
  let customerId = tenant.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: tenant.name,
      metadata: { tenant_id: tenant.id },
    });
    customerId = customer.id;
    await supabase.from("tenants").update({ stripe_customer_id: customerId }).eq("id", tenant.id);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enghub-eight.vercel.app";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: { name: price.label },
          unit_amount: price.amount,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    metadata: { tenant_id: tenant.id, plan },
    success_url: `${siteUrl}/dashboard/plano?success=1`,
    cancel_url: `${siteUrl}/dashboard/plano?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
