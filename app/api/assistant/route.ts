// app/api/assistant/route.ts
//
// The in-product "LotPilot Copilot" — an AI assistant that helps the signed-in
// dealer understand the system and their own numbers. It pulls a live snapshot of
// the dealer's data, composes a grounded system prompt, and streams a Claude reply.
//
// Auth: the user's Supabase session (RLS scopes every query to their dealer).
// Model: Claude via ANTHROPIC_API_KEY. With no key set, it degrades to a
// deterministic, snapshot-aware fallback so the assistant always responds.

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { LOTPILOT_KNOWLEDGE } from "@/lib/assistant/knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-opus-4-8";

type ChatMessage = { role: "user" | "assistant"; content: string };

/* eslint-disable @typescript-eslint/no-explicit-any */

async function buildSnapshot(supabase: any, userId: string): Promise<string> {
  // Everything here is RLS-scoped to the caller's dealer.
  const { data: profile } = await supabase
    .from("dp_profiles")
    .select("full_name, role, dealer_id")
    .eq("id", userId)
    .single();
  if (!profile?.dealer_id) return "No dealer is linked to this account.";

  const [dealer, vis, kpis, recos, leads, agent] = await Promise.all([
    supabase.from("dp_dealers").select("name, metro, vehicles, feed_type").eq("id", profile.dealer_id).single(),
    supabase.from("dp_visibility").select("score, score_delta, band").maybeSingle(),
    supabase.from("dp_kpis").select("label, value, sub").eq("scope", "today").order("sort"),
    supabase.from("dp_recommendations").select("title, priority, impact, status").order("sort"),
    supabase.from("dp_leads").select("temp, status"),
    supabase.from("dp_agent").select("status, display_name, channels, speed_to_lead_sec").maybeSingle(),
  ]);

  const d = dealer.data ?? {};
  const v = vis.data;
  const kp = (kpis.data ?? []) as any[];
  const rc = (recos.data ?? []) as any[];
  const ld = (leads.data ?? []) as any[];
  const ag = agent.data;

  const hot = ld.filter((l) => l.temp === "Hot").length;
  const openRecos = rc.filter((r) => (r.status ?? "open") !== "applied");
  const ch = ag?.channels ?? {};
  const channels = ["sms", "voice", "chat"].filter((c) => ch?.[c]).join(", ") || "none";

  return [
    `Dealer: ${d.name ?? "—"} (${d.metro ?? "—"}) · ${d.vehicles ?? 0} vehicles · feed: ${d.feed_type ?? "—"}`,
    `User: ${profile.full_name ?? "—"} (${profile.role ?? "—"})`,
    v ? `AI Visibility score: ${v.score}/100 (${v.score >= 0 ? "+" : ""}${v.score_delta ?? 0} trend, band "${v.band ?? "—"}")` : "AI Visibility: not yet computed",
    kp.length ? `Today's KPIs: ${kp.map((k) => `${k.label} ${k.value}${k.sub ? ` (${k.sub})` : ""}`).join("; ")}` : "Today's KPIs: none yet",
    `Leads worked: ${ld.length} (${hot} hot)`,
    rc.length ? `Recommended actions: ${openRecos.length} open of ${rc.length}. Top: ${openRecos.slice(0, 3).map((r) => `"${r.title}" [${r.priority}, ${r.impact}]`).join("; ") || "all applied"}` : "Recommended actions: none",
    ag ? `AI Sales Assistant "${ag.display_name}": ${ag.status}, channels: ${channels}, speed-to-lead ~${ag.speed_to_lead_sec}s` : "AI Sales Assistant: not configured",
  ].join("\n");
}

function fallbackReply(question: string, snapshot: string): string {
  const q = question.toLowerCase();
  const pick = (re: RegExp) => re.test(q);
  let body: string;
  if (pick(/visib|score|rank|cited|engine/)) {
    body =
      "Your AI Visibility score measures how often the AI answer engines (ChatGPT, Gemini, Perplexity, Copilot) cite your store when local shoppers ask buying questions. Open **AI Visibility** to see the score, the six ranking pillars, and which buyer questions you're winning. Anything not cited is lost reach — the Recommended actions target those first.";
  } else if (pick(/invisible|inventory|vin|vehicle|stock/)) {
    body =
      "Open **Inventory AI** and use the *Invisible to AI* filter — those VINs aren't cited by any engine yet, which is pure lost opportunity. Each row shows the vehicle's AI score, citing engines, AI-sourced leads, and the blocker keeping it from being fully optimized.";
  } else if (pick(/lead|conversation|reply|sms|text|speed/)) {
    body =
      "Your **AI Sales Assistant** handles every inbound AI lead over SMS, voice, and chat — replying in about 10 seconds, 24/7 — and works them to a booked appointment or credit app. See full transcripts and speed-to-lead on **Leads & Conversations**.";
  } else if (pick(/roi|attribut|sale|gross|report|revenue/)) {
    body =
      "**ROI & Attribution** credits sold cars and gross to the specific AI engine that produced them, plus your funnel, forecast, and a board-ready monthly report. That's where you prove the program's return.";
  } else if (pick(/deploy|assistant|agent|turn on|activate|persona/)) {
    body =
      "Open the **AI Sales Assistant** page to deploy or pause the agent, set its name, persona, channels, greeting, and human-handoff. It comes with every subscription and exclusively handles all of your AI traffic.";
  } else {
    body =
      "I'm your LotPilot Copilot — I can explain any page, your AI Visibility score, invisible inventory, your leads, or your ROI. Try asking \"what's my visibility score mean?\" or \"which cars are invisible to AI?\"";
  }
  return `${body}\n\n— Here's your current snapshot:\n${snapshot}`;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  let messages: ChatMessage[] = [];
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  messages = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12);
  if (!messages.length) {
    return new Response("No messages", { status: 422 });
  }

  const snapshot = await buildSnapshot(supabase, user.id);
  const system = `${LOTPILOT_KNOWLEDGE}\n\n# This dealer's live snapshot (use it to ground answers)\n${snapshot}`;

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // No key configured → deterministic, snapshot-aware fallback (always responds).
  if (!apiKey) {
    const last = [...messages].reverse().find((m) => m.role === "user");
    const text = fallbackReply(last?.content ?? "", snapshot);
    return new Response(text, {
      headers: { "content-type": "text/plain; charset=utf-8", "x-assistant-mode": "fallback" },
    });
  }

  const client = new Anthropic({ apiKey });
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        stream.on("text", (delta) => controller.enqueue(encoder.encode(delta)));
        await stream.finalMessage();
      } catch (err: any) {
        controller.enqueue(encoder.encode(`\n\n[Assistant error: ${err?.message ?? "unknown"}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "content-type": "text/plain; charset=utf-8", "x-assistant-mode": "live" },
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
