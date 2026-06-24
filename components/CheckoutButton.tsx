"use client";

import { useRef, useState } from "react";
import type { PlanId } from "@/lib/stripe/plans";

/**
 * Starts a dealer subscription checkout. POSTs the selected plan(s) to
 * /api/checkout; redirects to the returned Stripe Checkout URL when billing is
 * live, and shows a brief inline note until then. Styled by the caller so it
 * drops in wherever a CTA used to be.
 */
export default function CheckoutButton({
  plans,
  className,
  children,
}: {
  plans: PlanId[];
  className?: string;
  children: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function start() {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plans }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url as string;
        return;
      }
      setNote("Secure checkout opens here once billing is live ✓");
    } catch {
      setNote("Couldn't start checkout — please try again.");
    } finally {
      setBusy(false);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setNote(null), 3200);
    }
  }

  return (
    <button type="button" onClick={start} disabled={busy} className={className}>
      {busy ? "Starting secure checkout…" : note ?? children}
    </button>
  );
}
