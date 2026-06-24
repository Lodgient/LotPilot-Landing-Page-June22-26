// app/api/audit-lead/route.ts
//
// Audit email-gate lead capture (STUB).
// This is THE lead: the email + dealership name a dealer submits to unlock the
// full per-engine breakdown + gap report.

import { NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/anon";

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

  try {
    const supabase = createAnonClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("lp_marketing_leads") as any).insert({
      kind: "audit",
      dealership_name: dealershipName,
      email,
      website: (body.url || "").trim() || null,
      city: (body.city || "").trim() || null,
      score: typeof body.score === "number" ? Math.round(body.score) : null,
      source: "free-audit",
    });
    if (error) {
      console.error("[audit-lead] insert failed:", error.message);
      return NextResponse.json({ ok: false, error: "Couldn't save — please try again." }, { status: 500 });
    }
  } catch (e) {
    console.error("[audit-lead] insert threw:", e);
    return NextResponse.json({ ok: false, error: "Couldn't save — please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
