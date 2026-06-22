// app/api/visibility/ingest/route.ts
//
// REAL connector for LotPilot's AI-visibility engine.
//
// The engine (crawler + multi-engine query runner) POSTs per-VIN visibility
// results here and they land in dp_vehicles, lighting up the Inventory AI
// dashboard with LIVE data instead of the seeded sample.
//
// Security:
//   - Requires header `x-lotpilot-key` matching env LOTPILOT_INGEST_KEY.
//   - Writes with the Supabase SERVICE ROLE key (env SUPABASE_SERVICE_ROLE_KEY),
//     so RLS is bypassed server-side only. Neither secret is committed.
//   - Until both env vars are set the route returns 501 (not configured).
//
// Payload:
// {
//   "dealerId": "uuid",
//   "source": "lotpilot-engine",            // optional label
//   "vehicles": [
//     {
//       "vin": "string",                     // required (upsert key with dealerId)
//       "aiScore": 0-100, "enginesCiting": 0-5, "queriesMatched": 0,
//       "aiLeads": 0, "aiVdpViews": 0, "blocker": "string",
//       "trend": [number], "engines": {"ChatGPT":true,...},
//       "citations": [{ "query": "...", "topSource": "...", "engines": {...} }],
//       // optional inventory fields if the same call carries the feed:
//       "year":2023,"make":"Nissan","model":"Rogue","trim":"SV","body":"SUV",
//       "stockType":"Certified","price":24980,"mileage":28000,
//       "daysOnLot":14,"estGross":2100
//     }
//   ]
// }

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapVehicle(dealerId: string, v: any) {
  const row: Record<string, any> = { dealer_id: dealerId, vin: String(v.vin) };
  const set = (col: string, val: any) => {
    if (val !== undefined) row[col] = val;
  };
  set("year", v.year);
  set("make", v.make);
  set("model", v.model);
  set("trim", v.trim);
  set("body", v.body);
  set("stock_type", v.stockType);
  set("price", v.price);
  set("mileage", v.mileage);
  set("days_on_lot", v.daysOnLot);
  set("est_gross", v.estGross);
  set("ai_score", v.aiScore);
  set("engines_citing", v.enginesCiting);
  set("queries_matched", v.queriesMatched);
  set("ai_leads", v.aiLeads);
  set("ai_vdp_views", v.aiVdpViews);
  set("trend", v.trend);
  set("blocker", v.blocker);
  set("engines", v.engines);
  set("citations", v.citations);
  return row;
}

export async function POST(req: Request) {
  const expectedKey = process.env.LOTPILOT_INGEST_KEY;
  const admin = createAdminClient();

  if (!expectedKey || !admin) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Ingestion not configured. Set SUPABASE_SERVICE_ROLE_KEY and LOTPILOT_INGEST_KEY.",
      },
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
  const vehicles = body?.vehicles;
  if (!dealerId || !Array.isArray(vehicles) || vehicles.length === 0) {
    return NextResponse.json(
      { ok: false, error: "dealerId and a non-empty vehicles[] are required." },
      { status: 422 },
    );
  }

  const rows = vehicles
    .filter((v: any) => v && v.vin)
    .map((v: any) => mapVehicle(dealerId, v));

  const { error } = await admin
    .from("dp_vehicles")
    .upsert(rows, { onConflict: "dealer_id,vin" });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  await admin.from("dp_ingest_runs").insert({
    dealer_id: dealerId,
    source: body?.source ?? "api",
    vehicles_upserted: rows.length,
  });

  return NextResponse.json({ ok: true, upserted: rows.length });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
