import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { provisionDealer } from "@/lib/onboarding/provision";
import { PLANS, isPlanId, type PlanId } from "@/lib/stripe/plans";

export const runtime = "nodejs";

/**
 * Self-serve subscription checkout — the pay step of zero-touch onboarding.
 * Requires a signed-in user (created at /signup) so we can link the subscription
 * to their workspace.
 *
 * - Stripe configured  → returns a Checkout Session URL; provisioning happens on
 *   the `checkout.session.completed` webhook.
 * - Stripe NOT configured (pre-launch) → provisions a trial workspace immediately
 *   so the flow is fully usable now; swaps to real billing the moment keys land.
 */
export async function POST(req: Request) {
  let plans: PlanId[] = [];
  try {
    const body = await req.json();
    plans = (Array.isArray(body?.plans) ? body.plans : []).filter(isPlanId);
  } catch {
    /* ignore */
  }
  if (plans.length === 0) plans = ["visibility"];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not_signed_in" }, { status: 401 });
  }

  const meta = (user.user_metadata ?? {}) as Record<string, string>;
  const dealershipName = (meta.dealership || "").trim() || "Your dealership";
  const metro = (meta.metro || "").trim() || null;
  const fullName = (meta.full_name || "").trim() || null;
  const origin = new URL(req.url).origin;

  const stripe = getStripe();

  if (stripe) {
    const priceIds = plans.map((id) => process.env[PLANS[id].priceEnv]).filter(Boolean) as string[];
    if (priceIds.length !== plans.length) {
      return NextResponse.json({ error: "stripe_prices_not_configured" }, { status: 500 });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: priceIds.map((price) => ({ price, quantity: 1 })),
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { user_id: user.id, plans: plans.join(",") },
      },
      metadata: {
        user_id: user.id,
        plans: plans.join(","),
        dealership: dealershipName,
        metro: metro ?? "",
        full_name: fullName ?? "",
      },
      success_url: `${origin}/dashboard?welcome=1`,
      cancel_url: `${origin}/activate`,
    });
    return NextResponse.json({ url: session.url });
  }

  // ── Pre-launch fallback: no Stripe yet → provision a trial workspace now. ──
  const result = await provisionDealer({
    userId: user.id,
    dealershipName,
    metro,
    fullName,
    plans,
    status: "trialing",
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error === "service_role_not_configured" ? "onboarding_not_configured" : result.error },
      { status: 500 },
    );
  }
  return NextResponse.json({ provisioned: true, redirect: "/dashboard?welcome=1" });
}
