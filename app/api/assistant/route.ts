// app/api/assistant/route.ts
//
// The in-product "LotPilot Copilot" — an AI assistant that helps a dealer
// understand the system and their own numbers. It pulls a live snapshot of the
// dealer's data, composes a grounded system prompt, and streams a Claude reply.
//
// Auth: a signed-in user gets their own dealer (RLS-scoped). Anonymous visitors
// get the public demo dealer — same fallback the dashboard pages use — so the
// Copilot works on the public demo instead of 401ing.
// Model: Claude via ANTHROPIC_API_KEY. With no key set, it degrades to a
// deterministic, snapshot-aware fallback so the assistant always responds.

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { LOTPILOT_KNOWLEDGE } from "@/lib/assistant/knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-opus-4-8";

// The public read-only demo dealer (Capitol Nissan). Mirrors requireDealer() in
// lib/dashboard/queries.ts: anonymous visitors get this dealer's workspace, RLS-
// scoped, so the Copilot answers on the demo just like the dashboard renders.
const DEMO_DEALER_ID = "11111111-1111-1111-1111-111111111111";

type ChatMessage = { role: "user" | "assistant"; content: string };

/** Resolved chat context: which dealer the snapshot is for, and the user if any. */
type DealerCtx = { dealerId: string; userId: string | null };

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Resolve who's asking. A signed-in user gets their own dealer; an anonymous
 * visitor gets the public demo dealer (unless DASHBOARD_PUBLIC === "false").
 * Returns null only when we genuinely can't serve anyone (→ 401).
 */
async function resolveContext(supabase: any): Promise<DealerCtx | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("dp_profiles")
      .select("dealer_id")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.dealer_id) return { dealerId: profile.dealer_id, userId: user.id };
    return null; // signed in but not linked to a dealer
  }

  if (process.env.DASHBOARD_PUBLIC === "false") return null;
  return { dealerId: DEMO_DEALER_ID, userId: null };
}

async function buildSnapshot(supabase: any, ctx: DealerCtx) {
  // Everything below is RLS-scoped to the caller's dealer (anon → demo dealer).
  // Identify the user by id when signed in, else take the dealer's profile row.
  const { data: profile } = ctx.userId
    ? await supabase
        .from("dp_profiles")
        .select("full_name, role, dealer_id")
        .eq("id", ctx.userId)
        .maybeSingle()
    : await supabase
        .from("dp_profiles")
        .select("full_name, role, dealer_id")
        .eq("dealer_id", ctx.dealerId)
        .limit(1)
        .maybeSingle();

  const [dealer, vis, kpis, recos, leads, agent, vehicles] = await Promise.all([
    supabase.from("dp_dealers").select("name, metro, vehicles, feed_type").eq("id", ctx.dealerId).single(),
    supabase.from("dp_visibility").select("score, score_delta, band").maybeSingle(),
    supabase.from("dp_kpis").select("label, value, sub").eq("scope", "today").order("sort"),
    supabase.from("dp_recommendations").select("title, priority, impact, status").order("sort"),
    supabase.from("dp_leads").select("temp, status"),
    supabase.from("dp_agent").select("status, display_name, channels, speed_to_lead_sec").maybeSingle(),
    supabase.from("dp_vehicles").select("year, make, model, engines_citing, est_gross"),
  ]);

  const d = dealer.data ?? {};
  const v = vis.data;
  const kp = (kpis.data ?? []) as any[];
  const rc = (recos.data ?? []) as any[];
  const ld = (leads.data ?? []) as any[];
  const ag = agent.data;
  const vh = (vehicles.data ?? []) as any[];

  const hot = ld.filter((l) => l.temp === "Hot").length;
  const openRecos = rc.filter((r) => (r.status ?? "open") !== "applied");
  const ch = ag?.channels ?? {};
  const channels = ["sms", "voice", "chat"].filter((c) => ch?.[c]).join(", ") || "none";

  const invisible = vh.filter((x) => !x.engines_citing);
  const invisibleGross = invisible.reduce((s, x) => s + (Number(x.est_gross) || 0), 0);
  const invisibleExamples = invisible
    .slice(0, 3)
    .map((x) => [x.year, x.make, x.model].filter(Boolean).join(" "))
    .filter(Boolean);

  return {
    dealerName: d.name ?? "your store",
    metro: d.metro ?? "",
    vehicles: d.vehicles ?? 0,
    feedType: d.feed_type ?? "",
    userName: profile?.full_name ?? "",
    userRole: profile?.role ?? "",
    vis: v ? { score: v.score, delta: v.score_delta ?? 0, band: v.band ?? "" } : null,
    kpis: kp.map((k) => ({ label: k.label, value: k.value, sub: k.sub ?? "" })),
    leadsWorked: ld.length,
    hotLeads: hot,
    openRecos: openRecos.length,
    totalRecos: rc.length,
    topRecos: openRecos.slice(0, 3).map((r) => ({ title: r.title, priority: r.priority, impact: r.impact })),
    agent: ag ? { name: ag.display_name, status: ag.status, channels, speed: ag.speed_to_lead_sec } : null,
    scoredVehicles: vh.length,
    invisibleCount: invisible.length,
    invisibleGross,
    invisibleExamples,
  };
}

type Snapshot = Awaited<ReturnType<typeof buildSnapshot>>;

const fmtGross = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`);

// The grounding block handed to Claude as system context (live mode).
function snapshotToPrompt(s: Snapshot): string {
  return [
    `Dealer: ${s.dealerName} (${s.metro || "—"}) · ${s.vehicles} vehicles · feed: ${s.feedType || "—"}`,
    `User: ${s.userName || "—"} (${s.userRole || "—"})`,
    s.vis ? `AI Visibility score: ${s.vis.score}/100 (${s.vis.delta >= 0 ? "+" : ""}${s.vis.delta} trend, band "${s.vis.band}")` : "AI Visibility: not yet computed",
    s.kpis.length ? `Today's KPIs: ${s.kpis.map((k) => `${k.label} ${k.value}${k.sub ? ` (${k.sub})` : ""}`).join("; ")}` : "Today's KPIs: none yet",
    `Leads worked: ${s.leadsWorked} (${s.hotLeads} hot)`,
    s.scoredVehicles ? `Inventory: ${s.invisibleCount} of ${s.scoredVehicles} VINs invisible to AI (~${fmtGross(s.invisibleGross)} gross sitting dark)` : "",
    s.topRecos.length ? `Recommended actions: ${s.openRecos} open of ${s.totalRecos}. Top: ${s.topRecos.map((r) => `"${r.title}" [${r.priority}, ${r.impact}]`).join("; ")}` : "Recommended actions: none",
    s.agent ? `AI Sales Assistant "${s.agent.name}": ${s.agent.status}, channels: ${s.agent.channels}, speed-to-lead ~${s.agent.speed}s` : "AI Sales Assistant: not configured",
  ]
    .filter(Boolean)
    .join("\n");
}

// Deterministic, snapshot-grounded answers when no ANTHROPIC_API_KEY is set.
// Conversational and self-contained — weaves in live numbers, no raw data dump.
function fallbackReply(question: string, s: Snapshot): string {
  const q = question.toLowerCase();
  const pick = (re: RegExp) => re.test(q);

  if (pick(/invisible|inventory|vin|vehicle|stock|dark/)) {
    if (s.invisibleCount > 0) {
      const eg = s.invisibleExamples.length ? ` — like the ${s.invisibleExamples.join(", ")}` : "";
      return `Right now **${s.invisibleCount} of ${s.scoredVehicles}** of your vehicles are invisible to AI${eg}. No answer engine cites them yet, so that's roughly **${fmtGross(s.invisibleGross)} in gross sitting dark**. Open **Inventory AI** and use the *Invisible to AI* filter to see each one and the blocker holding it back — the Recommended actions tackle these first.`;
    }
    return `Good news — every vehicle we've scored is cited by at least one AI engine right now. Open **Inventory AI** for per-VIN scores, which engines cite each car, and AI-sourced leads.`;
  }
  if (pick(/visib|score|rank|cited|engine|pillar/)) {
    const sc = s.vis ? `Yours is **${s.vis.score}/100** (${s.vis.delta >= 0 ? "+" : ""}${s.vis.delta} lately, "${s.vis.band}").` : "It isn't computed yet.";
    return `Your AI Visibility score is how often the answer engines — ChatGPT, Gemini, Perplexity, Copilot — cite ${s.dealerName} when local shoppers ask buying questions. ${sc} Open **AI Visibility** for the six ranking pillars and the buyer questions you're winning or losing.`;
  }
  if (pick(/lead|conversation|reply|sms|text|speed|appoint/)) {
    const a = s.agent ? `**${s.agent.name}** (${s.agent.status}, ~${s.agent.speed}s first reply)` : "Your AI Sales Assistant";
    const worked = `**${s.leadsWorked} lead${s.leadsWorked === 1 ? "" : "s"}${s.hotLeads ? `, ${s.hotLeads} hot` : ""}**`;
    return `${a} works every inbound AI lead over ${s.agent?.channels ?? "SMS, voice, chat"}, 24/7 — answering questions and booking appointments or credit apps. You've worked ${worked}. See full transcripts and speed-to-lead on **Leads & Conversations**.`;
  }
  if (pick(/roi|attribut|sale|gross|report|revenue|cost/)) {
    const dark = s.invisibleCount > 0 ? ` It also quantifies the ~${fmtGross(s.invisibleGross)} in gross sitting dark on invisible inventory.` : "";
    return `**ROI & Attribution** credits sold cars and gross to the exact AI engine that produced them, with your funnel, forecast, and a board-ready monthly report.${dark} That's where you prove the program's return.`;
  }
  if (pick(/recommend|action|fix|priorit|to.?do|next step/)) {
    if (s.topRecos.length) {
      const list = s.topRecos.map((r) => `“${r.title}” (${r.impact})`).join(", ");
      return `You have **${s.openRecos} open recommended actions** of ${s.totalRecos}. Top priorities: ${list}. Open the **Command Center** to review and approve them.`;
    }
    return `You're all caught up — no open recommended actions right now. New ones appear on the **Command Center** as the engine finds opportunities.`;
  }
  if (pick(/deploy|assistant|agent|turn on|activate|persona|channel/)) {
    const st = s.agent ? ` Yours is **${s.agent.status}** on ${s.agent.channels}.` : "";
    return `Open the **AI Sales Assistant** page to deploy or pause the agent and set its name, persona, channels, greeting, and human-handoff.${st} It's included with every subscription and exclusively handles your AI traffic.`;
  }

  const hi = s.vis ? ` Right now your visibility is ${s.vis.score}/100${s.invisibleCount ? ` and ${s.invisibleCount} vehicles are invisible to AI` : ""}.` : "";
  return `I'm your LotPilot Copilot — I can explain any page or your live numbers: AI Visibility, invisible inventory, leads, ROI, or the AI Sales Assistant.${hi} Try “which cars are invisible to AI?” or “what does my visibility score mean?”`;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const ctx = await resolveContext(supabase);
  if (!ctx) {
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

  const snapshot = await buildSnapshot(supabase, ctx);
  const system = `${LOTPILOT_KNOWLEDGE}\n\n# This dealer's live snapshot (use it to ground answers)\n${snapshotToPrompt(snapshot)}`;

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
