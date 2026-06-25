import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { captureError } from "@/lib/notify";

export const runtime = "nodejs";

/**
 * Trigger a fresh AI-visibility scan for the signed-in dealer.
 *
 * Connector seam (Helmy): when the bot backend is live, forward this to its scan
 * trigger — e.g. POST `${BOT_SCAN_WEBHOOK_URL}` with the dealer id (auth via
 * BOT_SCAN_KEY), or enqueue a row the bot polls. For now it acknowledges so the
 * dashboard's scan UX works end-to-end; the demo/anon path is a no-op.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Public demo — nothing to scan, succeed quietly so the UI doesn't error.
    return NextResponse.json({ ok: true, demo: true });
  }

  const { data: profile } = await supabase
    .from("dp_profiles")
    .select("dealer_id")
    .eq("id", user.id)
    .maybeSingle();
  const dealerId = (profile as { dealer_id?: string } | null)?.dealer_id;
  if (!dealerId) {
    return NextResponse.json({ ok: false, error: "no_dealer" }, { status: 403 });
  }

  const webhook = process.env.BOT_SCAN_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(process.env.BOT_SCAN_KEY ? { "x-lotpilot-key": process.env.BOT_SCAN_KEY } : {}),
        },
        body: JSON.stringify({ dealer_id: dealerId, requested_by: user.id }),
      });
    } catch (e) {
      await captureError(e, { where: "scan bot trigger" });
      // Don't hard-fail the UX; the dealer can retry.
    }
  }

  return NextResponse.json({ ok: true, queued: true });
}
