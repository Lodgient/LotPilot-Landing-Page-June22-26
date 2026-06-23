import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Signs the visitor into the shared read-only demo workspace. Credentials live
// server-side only (env-overridable) so they never ship in the client bundle.
// Set DEMO_EMAIL / DEMO_PASSWORD in the environment and rotate the account.
const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "demo@capitolnissan.com";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "LotPilotDemo!23";

export async function POST() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  if (error) {
    return NextResponse.json({ error: "Demo sign-in unavailable" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
