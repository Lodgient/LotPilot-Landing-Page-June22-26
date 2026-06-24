import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Send a human reply to a lead (dealer takes over from the AI agent).
 *
 * Connector seam (Helmy): forward to the agent's outbound send (Twilio SMS /
 * ElevenLabs voice) and persist to dp_messages. For now it validates + ack's so
 * the inbox "take over → send" UX works; the demo/anon path is optimistic-only.
 */
export async function POST(req: Request) {
  let leadId = "";
  let text = "";
  try {
    const body = await req.json();
    leadId = String(body?.leadId ?? "").trim();
    text = String(body?.text ?? "").trim();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_body" }, { status: 400 });
  }
  if (!leadId || !text) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 422 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Public demo — accept optimistically, nothing is sent.
    return NextResponse.json({ ok: true, demo: true });
  }

  // TODO (Helmy): send via the agent's outbound channel + insert into dp_messages
  // ({ lead_id, sender: 'rep', body: text }). Requires the Twilio/ElevenLabs seam.
  const webhook = process.env.AGENT_SEND_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(process.env.AGENT_SEND_KEY ? { "x-lotpilot-key": process.env.AGENT_SEND_KEY } : {}),
        },
        body: JSON.stringify({ lead_id: leadId, text, sender: "rep", by: user.id }),
      });
    } catch (e) {
      console.error("[lead/reply] send failed:", e);
    }
  }

  return NextResponse.json({ ok: true, sent: true });
}
