// app/api/lead/route.ts
//
// "Connect your inventory feed" lead capture (STUB).

import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface FeedLeadPayload {
  dealershipName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  feedType?: string;
  rooftops?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: FeedLeadPayload = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const dealershipName = (body.dealershipName || "").trim();
  const email = (body.email || "").trim();

  if (!dealershipName) {
    return NextResponse.json(
      { ok: false, error: "Dealership name is required." },
      { status: 422 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid work email." },
      { status: 422 },
    );
  }

  // TODO: wire backend — persist to CRM/Supabase + notify sales.
  // Avoid logging PII (email/phone) to stdout; record only non-sensitive fields.
  console.info("[feed-lead]", {
    dealershipName,
    feedType: body.feedType,
    at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
