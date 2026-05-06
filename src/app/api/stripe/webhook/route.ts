import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const tenantId = session.metadata?.tenant_id;
    const plan = session.metadata?.plan;
    const subscriptionId = session.subscription as string;

    if (tenantId && plan) {
      await supabase
        .from("tenants")
        .update({
          plan,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer as string,
        })
        .eq("id", tenantId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;

    await supabase
      .from("tenants")
      .update({ plan: "FREE", stripe_subscription_id: null })
      .eq("stripe_customer_id", customerId);
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;

    if (sub.status === "active") {
      // Plan change via portal — keep subscription id updated
      await supabase
        .from("tenants")
        .update({ stripe_subscription_id: sub.id })
        .eq("stripe_customer_id", customerId);
    }

    if (sub.status === "past_due" || sub.status === "unpaid" || sub.status === "canceled") {
      await supabase
        .from("tenants")
        .update({ plan: "FREE", stripe_subscription_id: null })
        .eq("stripe_customer_id", customerId);
    }
  }

  return NextResponse.json({ received: true });
}
