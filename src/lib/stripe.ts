import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export const PLAN_PRICES: Record<string, { amount: number; label: string }> = {
  PRO:     { amount: 4900,  label: "EngHub PRO"     },
  EMPRESA: { amount: 12900, label: "EngHub Empresa"  },
  PREMIUM: { amount: 29900, label: "EngHub Premium"  },
};
