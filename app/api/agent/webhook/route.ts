// app/api/agent/webhook/route.ts
//
// REAL inbound webhook for LotPilot's AI SMS/voice agent (Twilio / ElevenLabs).
// The agent posts lead + conversation events; they land in dp_leads/dp_messages
// and show up live on the Leads & Conversations board.
//
// Auth: x-lotpilot-key header == env LOTPILOT_INGEST_KEY.
// Write: Supabase service role. 501 until configured.
//
// Events:
//   { dealerId, event: "lead.upsert", lead: { externalId, name, vehicle, source,
//       status, temp, firstReplySec, creditApp, time } }
//   { dealerId, event: "message.add", leadExternalId, message: { from, text, time } }

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(req: Request) {
  const expectedKey = process.env.LOTPILOT_INGEST_KEY;
  const admin = createAdminClient();
  if (!expectedKey || !admin) {
    return NextResponse.json(
      { ok: false, error: "Agent webhook not configured. Set SUPABASE_SERVICE_ROLE_KEY and LOTPILOT_INGEST_KEY." },
      { status: 501 },
    );
  }
  if (req.headers.get("x-lotpilot-key") !== expectedKey) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const dealerId = body?.dealerId;
  if (!dealerId) {
    return NextResponse.json({ ok: false, error: "dealerId is required." }, { status: 422 });
  }

  if (body.event === "lead.upsert") {
    const l = body.lead ?? {};
    if (!l.externalId) {
      return NextResponse.json({ ok: false, error: "lead.externalId is required." }, { status: 422 });
    }
    const row: Record<string, any> = { dealer_id: dealerId, external_id: String(l.externalId) };
    const set = (c: string, v: any) => v !== undefined && (row[c] = v);
    set("name", l.name);
    set("vehicle", l.vehicle);
    set("source", l.source);
    set("status", l.status);
    set("temp", l.temp);
    set("first_reply_sec", l.firstReplySec);
    set("credit_app", l.creditApp);
    set("time_label", l.time);
    const { error } = await admin.from("dp_leads").upsert(row, { onConflict: "dealer_id,external_id" });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.event === "message.add") {
    const m = body.message ?? {};
    const { data: lead } = await admin
      .from("dp_leads")
      .select("id")
      .eq("dealer_id", dealerId)
      .eq("external_id", String(body.leadExternalId))
      .maybeSingle();
    if (!lead) {
      return NextResponse.json({ ok: false, error: "Lead not found for leadExternalId." }, { status: 404 });
    }
    const { error } = await admin.from("dp_messages").insert({
      lead_id: lead.id,
      sender: m.from ?? "agent",
      body: m.text ?? "",
      time_label: m.time ?? null,
    });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "Unknown event." }, { status: 400 });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
