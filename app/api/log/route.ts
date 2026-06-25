import { NextResponse } from "next/server";
import { captureError } from "@/lib/notify";

export const runtime = "nodejs";

/** Sink for client-side errors (from app/error.tsx) → logged + Slack-alerted. */
export async function POST(req: Request) {
  try {
    const b = await req.json();
    await captureError(b?.message || "client error", {
      where: b?.where || "client",
      digest: b?.digest,
      url: b?.url,
    });
  } catch {
    /* ignore */
  }
  return NextResponse.json({ ok: true });
}
