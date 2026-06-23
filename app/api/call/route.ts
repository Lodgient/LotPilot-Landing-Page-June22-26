import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Normalize loose user input to E.164. Returns null if it can't.
function toE164(raw: string): string | null {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/[^\d]/g, "");
  if (trimmed.startsWith("+") && digits.length >= 8 && digits.length <= 15) {
    return "+" + digits;
  }
  if (digits.length === 10) return "+1" + digits; // assume US/Canada
  if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
  return null;
}

export async function POST(req: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const phoneNumberId = process.env.ELEVENLABS_PHONE_NUMBER_ID;

  // Any missing config -> feature isn't switched on in this environment yet.
  if (!apiKey || !agentId || !phoneNumberId) {
    return NextResponse.json({ error: "call_unavailable" }, { status: 503 });
  }

  let body: { phone?: string; consent?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body.consent) {
    return NextResponse.json({ error: "consent_required" }, { status: 422 });
  }

  const to = toE164(body.phone || "");
  if (!to) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 422 });
  }

  const res = await fetch("https://api.elevenlabs.io/v1/convai/twilio/outbound-call", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agent_id: agentId,
      agent_phone_number_id: phoneNumberId,
      to_number: to,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "call_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
