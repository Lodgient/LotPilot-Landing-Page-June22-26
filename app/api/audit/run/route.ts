// app/api/audit/run/route.ts
//
// LIVE-MODE audit endpoint (STUB).
//
// In production this is where LotPilot's real AI-visibility engine wires in:
//   1. Crawl the dealer URL (render + raw) and score the five AVTS pillars
//      against what GPTBot / PerplexityBot / ClaudeBot can actually read.
//   2. Run the buyer-style queries against each answer engine and capture the
//      sources each one cites (this reuses the same engine that powers the
//      consumer site's visibility checks).
//   3. Only name a competitor as "winning" when a live query actually returned
//      them (see CLAUDE CODE BRIEF §4 guardrails).
//
// Until that backend exists, we fall back to the deterministic demo report so
// the endpoint always responds. The `mode` field on the response tells the UI
// whether the data is live or representative.

import { NextResponse } from "next/server";
import { generateReport } from "@/lib/audit/generateReport";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { url?: string; city?: string; dealershipName?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const url = (body.url || "").trim();
  const city = (body.city || "").trim();

  if (!url) {
    return NextResponse.json(
      { ok: false, error: "A dealership website URL is required." },
      { status: 422 },
    );
  }

  // TODO: wire backend — replace the line below with the real crawl + multi-engine
  // query pipeline. Keep the AuditReport shape so the UI needs no changes.
  const report = generateReport(url, city, body.dealershipName);

  // Mark the source of truth honestly. When the real engine lands, set "live".
  const liveReport = { ...report, mode: "demo" as const };

  return NextResponse.json({ ok: true, report: liveReport });
}
