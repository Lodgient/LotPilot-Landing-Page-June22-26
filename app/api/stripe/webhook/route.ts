import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { provisionDealer } from "@/lib/onboarding/provision";
import { isPlanId, type PlanId } from "@/lib/stripe/plans";

export const runtime = "nodejs";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Stripe webhook — the moment a dealer pays, provision their workspace. No human
 * in the loop. Set STRIPE_WEBHOOK_SECRET and point a Stripe webhook at
 * /api/stripe/webhook for: checkout.session.completed, customer.subscription.updated,
 * customer.subscription.deleted.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 501 });
  }

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", secret);
  } catch (err: any) {
    return NextResponse.json({ error: `signature: ${err?.message}` }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as any;
      const userId: string | undefined = s.client_reference_id || s.metadata?.user_id;
      if (userId) {
        const plans = String(s.metadata?.plans || "visibility")
          .split(",")
          .filter(isPlanId) as PlanId[];
        await provisionDealer({
          userId,
          dealershipName: (s.metadata?.dealership || "").trim() || "Your dealership",
          metro: (s.metadata?.metro || "").trim() || null,
          fullName: (s.metadata?.full_name || "").trim() || null,
          plans: plans.length ? plans : ["visibility"],
          status: "active",
          stripeCustomerId: typeof s.customer === "string" ? s.customer : null,
          stripeSubscriptionId: typeof s.subscription === "string" ? s.subscription : null,
        });
      }
    } else if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as any;
      const admin = createAdminClient();
      if (admin) {
        const status = event.type === "customer.subscription.deleted" ? "canceled" : sub.status;
        await (admin.from("dp_dealers") as any)
          .update({ subscription_status: status })
          .eq("stripe_subscription_id", sub.id);
      }
    }
  } catch (err: any) {
    console.error("[stripe webhook] handler error:", err?.message);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
