// app/api/audit-lead/route.ts
//
// Audit email-gate lead capture (STUB).
// This is THE lead: the email + dealership name a dealer submits to unlock the
// full per-engine breakdown + gap report.

import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface AuditLeadPayload {
  email?: string;
  dealershipName?: string;
  url?: string;
  city?: string;
  score?: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: AuditLeadPayload = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const email = (body.email || "").trim();
  const dealershipName = (body.dealershipName || "").trim();

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid work email." },
      { status: 422 },
    );
  }
  if (!dealershipName) {
    return NextResponse.json(
      { ok: false, error: "Dealership name is required." },
      { status: 422 },
    );
  }

  // TODO: wire backend — persist the lead (CRM/Supabase), fire notification,
  // and enqueue a follow-up. For now we just log + acknowledge.
  console.info("[audit-lead]", {
    email,
    dealershipName,
    url: body.url,
    city: body.city,
    score: body.score,
    at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
