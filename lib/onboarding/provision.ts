import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS, type PlanId } from "@/lib/stripe/plans";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ProvisionInput {
  userId: string;
  dealershipName: string;
  metro?: string | null;
  fullName?: string | null;
  website?: string | null;
  plans: PlanId[];
  status: "active" | "trialing";
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

export interface ProvisionResult {
  ok: boolean;
  dealerId?: string;
  error?: string;
}

/**
 * Create (or update) a dealer workspace for a signed-up user — fully automated,
 * no human in the loop. Idempotent: keyed on the user's profile, so replays
 * (e.g. a retried Stripe webhook) won't duplicate. Uses the service-role client
 * so it bypasses RLS to write the dealer + profile rows.
 */
export async function provisionDealer(input: ProvisionInput): Promise<ProvisionResult> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "service_role_not_configured" };

  const agentAddon = input.plans.includes("agent");
  const planLabel = input.plans.map((p) => PLANS[p].name).join(" + ");
  const now = new Date().toISOString();

  const subscription = {
    subscription_status: input.status,
    plan: planLabel,
    agent_addon: agentAddon,
    stripe_customer_id: input.stripeCustomerId ?? null,
    stripe_subscription_id: input.stripeSubscriptionId ?? null,
    activated_at: now,
  };

  // Already provisioned? Update the linked dealer's subscription and return.
  const { data: existing } = await (admin.from("dp_profiles") as any)
    .select("dealer_id")
    .eq("id", input.userId)
    .maybeSingle();

  if (existing?.dealer_id) {
    await (admin.from("dp_dealers") as any).update(subscription).eq("id", existing.dealer_id);
    return { ok: true, dealerId: existing.dealer_id };
  }

  // First time: create the dealer, then link the user's profile to it.
  const { data: dealer, error: dErr } = await (admin.from("dp_dealers") as any)
    .insert({
      name: input.dealershipName,
      metro: input.metro ?? null,
      website: input.website ?? null,
      ...subscription,
    })
    .select("id")
    .single();

  if (dErr || !dealer) return { ok: false, error: dErr?.message ?? "dealer_insert_failed" };

  const { error: pErr } = await (admin.from("dp_profiles") as any).upsert({
    id: input.userId,
    dealer_id: dealer.id,
    full_name: input.fullName ?? null,
    role: "General Manager",
  });
  if (pErr) return { ok: false, error: pErr.message };

  return { ok: true, dealerId: dealer.id };
}
