import { NextResponse } from "next/server";
import { isPlanId, type PlanId } from "@/lib/stripe/plans";
// `PLANS` (from "@/lib/stripe/plans") holds each plan's Stripe Price-ID env var —
// used in the commented Stripe block below when the live API is wired.

/**
 * Dealer subscription checkout. The UI POSTs the selected plan(s); this returns
 * a Stripe Checkout URL to redirect to. Until the live Stripe API is wired
 * (final step), it returns { status: "stripe_not_configured" } so the button
 * degrades gracefully instead of erroring.
 *
 * To go live: `npm i stripe`, set STRIPE_SECRET_KEY + STRIPE_PRICE_* env vars,
 * and uncomment the block below. Nothing else in the app needs to change.
 */
export async function POST(req: Request) {
  let plans: PlanId[] = [];
  try {
    const body = await req.json();
    plans = (Array.isArray(body?.plans) ? body.plans : []).filter(isPlanId);
  } catch {
    /* ignore bad body */
  }
  if (plans.length === 0) {
    return NextResponse.json({ error: "Select at least one plan." }, { status: 400 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ status: "stripe_not_configured", plans }, { status: 200 });
  }

  // ── Connect Stripe here (final step) ──────────────────────────────────────
  // import Stripe from "stripe";
  // const stripe = new Stripe(secret);
  // const origin = new URL(req.url).origin;
  // const line_items = plans.map((id) => ({
  //   price: process.env[PLANS[id].priceEnv]!, // the Stripe Price ID for this plan
  //   quantity: 1,
  // }));
  // const session = await stripe.checkout.sessions.create({
  //   mode: "subscription",
  //   line_items,
  //   allow_promotion_codes: true,
  //   success_url: `${origin}/dashboard?checkout=success`,
  //   cancel_url: `${origin}/#pricing`,
  //   // customer_email / metadata: { dealer_id } when we have the signed-in dealer
  // });
  // return NextResponse.json({ url: session.url });
  // ──────────────────────────────────────────────────────────────────────────

  // Stripe key present but SDK not yet enabled — same graceful signal.
  return NextResponse.json({ status: "stripe_not_configured", plans }, { status: 200 });
}
