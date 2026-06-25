// app/api/lead/route.ts
//
// "Connect your inventory feed" lead capture. Persists to lp_marketing_leads
// (RLS allows anon INSERT only — PII never readable client-side).

import { NextResponse } from "next/server";
import { createAnonClient } from "@/lib/supabase/anon";
import { notifyNewLead, sendEmail, feedThanksEmail, captureError } from "@/lib/notify";

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

  try {
    const supabase = createAnonClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("lp_marketing_leads") as any).insert({
      kind: "feed",
      dealership_name: dealershipName,
      contact_name: (body.contactName || "").trim() || null,
      email,
      phone: (body.phone || "").trim() || null,
      website: (body.website || "").trim() || null,
      feed_type: (body.feedType || "").trim() || null,
      rooftops: (body.rooftops || "").trim() || null,
      message: (body.message || "").trim() || null,
      source: "feed-onboarding-chat",
    });
    if (error) {
      await captureError(error, { where: "feed-lead insert" });
      return NextResponse.json({ ok: false, error: "Couldn't save — please try again." }, { status: 500 });
    }
  } catch (e) {
    await captureError(e, { where: "feed-lead" });
    return NextResponse.json({ ok: false, error: "Couldn't save — please try again." }, { status: 500 });
  }

  await notifyNewLead({
    kind: "feed",
    dealership: dealershipName,
    email,
    website: (body.website || "").trim() || null,
    feedType: (body.feedType || "").trim() || null,
  });
  const tpl = feedThanksEmail({ dealership: dealershipName });
  await sendEmail({ to: email, subject: tpl.subject, html: tpl.html });

  return NextResponse.json({ ok: true });
}
