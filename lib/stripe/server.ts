import Stripe from "stripe";

/**
 * Returns a configured Stripe client, or null if STRIPE_SECRET_KEY isn't set.
 * Callers fall back gracefully (e.g. a pre-launch trial) when null.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}
