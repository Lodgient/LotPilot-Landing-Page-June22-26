// LotPilot subscription plans. Prices here are the source of truth for display;
// the matching Stripe Price IDs come from env (set when the live API is wired).
//
//   STRIPE_PRICE_VISIBILITY = price_xxx  (AI Visibility, $399/mo)
//   STRIPE_PRICE_AGENT      = price_xxx  (AI Sales Agent, +$699/mo)

export type PlanId = "visibility" | "agent";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // USD / month
  /** Env var holding this plan's Stripe Price ID. */
  priceEnv: string;
}

export const PLANS: Record<PlanId, Plan> = {
  visibility: { id: "visibility", name: "AI Visibility", price: 399, priceEnv: "STRIPE_PRICE_VISIBILITY" },
  agent: { id: "agent", name: "AI Sales Agent", price: 699, priceEnv: "STRIPE_PRICE_AGENT" },
};

export function isPlanId(v: unknown): v is PlanId {
  return typeof v === "string" && v in PLANS;
}
