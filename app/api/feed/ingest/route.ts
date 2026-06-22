// app/api/feed/ingest/route.ts
//
// REAL inventory-feed connector. A normalizer (vAuto / HomeNet / Dealer.com /
// DealerSocket / CSV / XML -> JSON) POSTs the dealer's current inventory here;
// rows upsert into dp_vehicles and the dealer's sync status is refreshed.
//
// Auth: x-lotpilot-key header == env LOTPILOT_INGEST_KEY.
// Write: Supabase service role (env SUPABASE_SERVICE_ROLE_KEY). 501 until set.

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
  return row;
}

export async function POST(req: Request) {
  const expectedKey = process.env.LOTPILOT_INGEST_KEY;
  const admin = createAdminClient();
  if (!expectedKey || !admin) {
    return NextResponse.json(
      { ok: false, error: "Feed ingestion not configured. Set SUPABASE_SERVICE_ROLE_KEY and LOTPILOT_INGEST_KEY." },
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
  const feedType = body?.feedType;
  if (!dealerId || !Array.isArray(vehicles) || vehicles.length === 0) {
    return NextResponse.json(
      { ok: false, error: "dealerId and a non-empty vehicles[] are required." },
      { status: 422 },
    );
  }

  const rows = vehicles.filter((v: any) => v && v.vin).map((v: any) => mapVehicle(dealerId, v));

  const { error } = await admin.from("dp_vehicles").upsert(rows, { onConflict: "dealer_id,vin" });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  await admin
    .from("dp_dealers")
    .update({ vehicles: rows.length, last_sync: "just now", ...(feedType ? { feed_type: feedType } : {}) })
    .eq("id", dealerId);

  await admin.from("dp_ingest_runs").insert({
    dealer_id: dealerId,
    source: body?.source ?? "feed",
    vehicles_upserted: rows.length,
  });

  return NextResponse.json({ ok: true, upserted: rows.length });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
