"use client";

import { useEffect, useRef, useState } from "react";
import Icon, { type IconName } from "@/components/Icon";
import { Card, PanelHeading } from "@/components/dashboard/ui";
import { Sparkline, TrendPill } from "@/components/dashboard/charts";
import CallMe from "@/components/dashboard/CallMe";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { AgentConfig, AgentPerformance } from "@/lib/dashboard/types";

const PERSONAS = [
  { id: "warm", label: "Warm & friendly", desc: "Approachable and reassuring — great for first-time buyers." },
  { id: "concise", label: "Concise & direct", desc: "Gets to the point fast — ideal for high-intent shoppers." },
  { id: "luxury", label: "White-glove / luxury", desc: "Polished and premium — fits luxury and import stores." },
];

const ACCENT_CHIP: Record<string, string> = {
  cyan: "bg-cyan/12 text-cyan ring-cyan/20",
  accent: "bg-accent/12 text-accent ring-accent/20",
  violet: "bg-violet/15 text-violet ring-violet/20",
  warn: "bg-warn/12 text-warn ring-warn/20",
};

// Gentle rising series ending at the current value, for KPI sparklines.
function rampUp(end: number, n = 9, factor = 0.78) {
  const start = Math.max(0, Math.round(end * factor));
  return Array.from({ length: n }, (_, i) => Math.round(start + (end - start) * (i / (n - 1))));
}
function trendPct(series: number[]) {
  const a = series[0] || 1;
  return Math.round(((series[series.length - 1] - a) / Math.max(1, a)) * 100);
}

// Each persona maps to a pre-rendered ElevenLabs voice sample shipped in
// /public/audio. Keeping these static keeps the demo instant and free of any
// runtime API key; live custom-text TTS is a future enhancement.
const VOICE: Record<string, { file: string; name: string }> = {
  warm: { file: "/audio/ava-warm.mp3", name: "Jessica" },
  concise: { file: "/audio/ava-concise.mp3", name: "Sarah" },
  luxury: { file: "/audio/ava-luxury.mp3", name: "Matilda" },
};

const CHANNELS: { id: "sms" | "voice" | "chat"; label: string; icon: IconName; share: number }[] = [
  { id: "sms", label: "SMS / Text", icon: "messages", share: 62 },
  { id: "voice", label: "Voice calls", icon: "phone", share: 28 },
  { id: "chat", label: "Website chat", icon: "sparkles", share: 10 },
];

function money(n: number) {
  return `$${Math.round(n).toLocaleString()}`;
}

export default function AgentConsole({
  initial,
  performance,
  dealerName,
}: {
  initial: AgentConfig;
  performance: AgentPerformance;
  dealerName: string;
}) {
  const [cfg, setCfg] = useState<AgentConfig>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  // Voice preview
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [voiceBusy, setVoiceBusy] = useState(false);
  // Cache the last generated clip so replaying identical text+persona is instant.
  const cacheRef = useRef<{ key: string; url: string } | null>(null);
  const voice = VOICE[cfg.persona] ?? VOICE.warm;

  function stopVoice() {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    setPlaying(false);
  }

  // Swapping persona swaps the voice — stop any clip that's mid-play first.
  function selectPersona(id: string) {
    if (id === cfg.persona) return;
    stopVoice();
    patch({ persona: id });
  }

  function play(src: string) {
    const a = audioRef.current;
    if (!a) return;
    a.src = src;
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  // "Hear Ava": voice the live greeting text in the selected persona's voice
  // via /api/tts. Falls back to the pre-rendered static sample if the TTS
  // endpoint is unavailable (e.g. no API key configured in the environment).
  async function toggleVoice() {
    if (playing) {
      stopVoice();
      return;
    }
    const text = cfg.greeting.replace(/\{vehicle\}/gi, "2024 Nissan Rogue").trim();
    if (!text) {
      play(voice.file);
      return;
    }
    const key = `${cfg.persona}|${text}`;
    if (cacheRef.current?.key === key) {
      play(cacheRef.current.url);
      return;
    }
    setVoiceBusy(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, persona: cfg.persona }),
      });
      if (!res.ok) {
        play(voice.file); // graceful fallback to static sample
        return;
      }
      const url = URL.createObjectURL(await res.blob());
      if (cacheRef.current) URL.revokeObjectURL(cacheRef.current.url);
      cacheRef.current = { key, url };
      play(url);
    } catch {
      play(voice.file);
    } finally {
      setVoiceBusy(false);
    }
  }

  function patch(p: Partial<AgentConfig>) {
    setCfg((c) => ({ ...c, ...p }));
    setDirty(true);
  }

  async function persist(next: AgentConfig) {
    setSaving(true);
    setSaveError(null);
    const supabase = createClient();
    // RLS scopes this to the caller's dealer; the .neq guard just gives the
    // update a WHERE clause so it targets the dealer's single row.
    const { error } = await supabase
      .from("dp_agent")
      .update({
        status: next.status,
        display_name: next.displayName,
        persona: next.persona,
        channels: next.channels,
        greeting: next.greeting,
        handoff_phone: next.handoffPhone || null,
        business_hours: next.businessHours,
        updated_at: new Date().toISOString(),
      })
      .neq("dealer_id", "00000000-0000-0000-0000-000000000000");
    setSaving(false);
    if (error) {
      // The shared demo workspace is read-only, so writes are expected to fail
      // here — surface that honestly instead of flashing a fake "Saved".
      setSaveError("This is a read-only demo — changes won't be saved.");
      return;
    }
    setSavedAt(new Date().toLocaleTimeString());
    setDirty(false);
  }

  async function toggleStatus() {
    const next: AgentConfig = {
      ...cfg,
      status: cfg.status === "active" ? "paused" : "active",
    };
    setCfg(next);
    await persist(next);
  }

  const live = cfg.status === "active";
  const activeNow = Math.max(2, (performance.appts % 5) + 2);
  const selectedPersona = PERSONAS.find((p) => p.id === cfg.persona) ?? PERSONAS[0];

  const perfCards = [
    { label: "Leads worked", value: performance.leadsWorked.toLocaleString(), icon: "messages" as IconName, accent: "cyan" as const, base: performance.leadsWorked },
    { label: "Appointments", value: performance.appts.toLocaleString(), icon: "calendar" as IconName, accent: "violet" as const, base: performance.appts },
    { label: "Credit apps", value: performance.creditApps.toLocaleString(), icon: "file" as IconName, accent: "warn" as const, base: performance.creditApps },
    { label: "Attributed sales", value: performance.attributedSales.toLocaleString(), icon: "check" as IconName, accent: "accent" as const, base: performance.attributedSales },
    { label: "Attributed gross", value: money(performance.gross), icon: "chart" as IconName, accent: "accent" as const, base: performance.gross },
  ].map((s) => {
    const spark = rampUp(s.base);
    return { ...s, spark, trend: trendPct(spark) };
  });

  return (
    <div className="space-y-6">
      {/* hero status */}
      <Card glow className="relative overflow-hidden">
        <div className="glow-cyan pointer-events-none absolute -right-10 -top-16 h-56 w-56 opacity-50" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan to-violet text-white shadow-[0_10px_28px_-10px_rgba(37,99,235,0.65)]">
              <span className="text-2xl font-bold">{cfg.displayName.charAt(0) || "A"}</span>
              <span
                className={cn(
                  "absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-panel text-white",
                  live ? "bg-accent" : "bg-warn",
                )}
                title={live ? "Live" : "Paused"}
              >
                <Icon name={live ? "bolt" : "close"} size={10} strokeWidth={2.5} />
              </span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold tracking-tight text-ink">{cfg.displayName}</h2>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    live
                      ? "border-accent/30 bg-accent/10 text-accent"
                      : "border-warn/30 bg-warn/10 text-warn",
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-accent shadow-[0_0_8px] shadow-accent" : "bg-warn")} />
                  {live ? "Live — handling all AI traffic" : "Paused"}
                </span>
              </div>
              <p className="mt-1 max-w-xl text-sm text-ink-muted">
                Your AI Sales Assistant is included with every LotPilot subscription. It
                exclusively works every inbound AI lead for {dealerName} — SMS, voice, and chat —
                replying in ~{cfg.speedToLeadSec}s, 24/7, and turning conversations into sold cars.
              </p>
              {live && (
                <p className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
                  {activeNow} conversations active right now
                </p>
              )}
            </div>
          </div>
          <button
            onClick={toggleStatus}
            disabled={saving}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-60",
              live
                ? "border border-line-strong text-ink hover:border-warn/50 hover:bg-black/[0.04]"
                : "bg-cyan text-ink-inverse cta-glow hover:bg-cyan/90",
            )}
          >
            <Icon name={live ? "close" : "bolt"} size={16} strokeWidth={2} />
            {live ? "Pause assistant" : "Deploy assistant"}
          </button>
        </div>
      </Card>

      {/* performance */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {perfCards.map((s) => (
          <Card key={s.label} className="surface-hover flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-lg ring-1 ring-inset",
                  ACCENT_CHIP[s.accent],
                )}
              >
                <Icon name={s.icon} size={16} />
              </span>
              <TrendPill value={s.trend} />
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <div className="text-2xl font-bold tracking-tight text-ink">{s.value}</div>
                <div className="mt-0.5 text-xs text-ink-muted">{s.label}</div>
              </div>
              <Sparkline data={s.spark} accent={s.accent} />
            </div>
          </Card>
        ))}
      </div>

      {/* live call demo */}
      <CallMe />

      {/* test the assistant live */}
      <TestAva name={cfg.displayName} persona={cfg.persona} greeting={cfg.greeting} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* configuration */}
        <Card>
          <PanelHeading title="Assistant setup" sub="Tune how your AI works every lead" />
          <div className="space-y-5">
            <Field label="Assistant name">
              <input
                value={cfg.displayName}
                onChange={(e) => patch({ displayName: e.target.value })}
                className="input"
              />
            </Field>

            <Field label="Persona">
              <div className="flex flex-wrap gap-2">
                {PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectPersona(p.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      cfg.persona === p.id
                        ? "border-cyan/40 bg-cyan/12 text-cyan"
                        : "border-line text-ink-muted hover:text-ink",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                {selectedPersona.desc}{" "}
                <span className="text-ink-faint">· Voice:</span>{" "}
                <span className="text-ink-soft">{voice.name}</span>
              </p>
            </Field>

            <Field label="Channels it handles">
              <div className="grid gap-2 sm:grid-cols-3">
                {CHANNELS.map((c) => {
                  const on = cfg.channels[c.id];
                  return (
                    <button
                      key={c.id}
                      onClick={() => patch({ channels: { ...cfg.channels, [c.id]: !on } })}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                        on
                          ? "border-accent/30 bg-accent/[0.06] text-ink"
                          : "border-line bg-black/[0.02] text-ink-muted hover:text-ink",
                      )}
                    >
                      <Icon name={c.icon} size={15} className={on ? "text-accent" : ""} />
                      <span className="flex-1 text-left">{c.label}</span>
                      <span
                        className="text-xs text-ink-faint"
                        title="Share of AI leads on this channel"
                      >
                        {c.share}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </Field>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="block text-xs font-medium text-ink-soft">Opening message</label>
                <button
                  type="button"
                  onClick={toggleVoice}
                  disabled={voiceBusy}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60",
                    playing
                      ? "border-cyan/50 bg-cyan/15 text-cyan"
                      : "border-line-strong text-ink-soft hover:border-cyan/50 hover:text-ink",
                  )}
                >
                  <Icon name={voiceBusy ? "sparkles" : playing ? "close" : "play"} size={12} strokeWidth={2.25} />
                  {voiceBusy ? "Generating…" : playing ? "Stop" : "Hear Ava"}
                </button>
              </div>
              <textarea
                value={cfg.greeting}
                onChange={(e) => patch({ greeting: e.target.value })}
                rows={3}
                className="input resize-none"
              />
              <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <p className="text-[11px] text-ink-faint">
                  Use <code className="text-ink-soft">{"{vehicle}"}</code> to drop in the car they asked about.
                </p>
                <p className="text-[11px] text-ink-faint">
                  Voice: <span className="text-ink-soft">{voice.name}</span> · speaks your text live
                </p>
              </div>
              <audio ref={audioRef} preload="none" onEnded={() => setPlaying(false)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Human handoff number">
                <input
                  value={cfg.handoffPhone}
                  onChange={(e) => patch({ handoffPhone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="input"
                />
              </Field>
              <Field label="Hours">
                <input
                  value={cfg.businessHours}
                  onChange={(e) => patch({ businessHours: e.target.value })}
                  className="input"
                />
              </Field>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => persist(cfg)}
                disabled={saving || !dirty}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-cyan px-5 text-sm font-semibold text-ink-inverse transition-colors hover:bg-cyan/90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              {savedAt && !dirty && !saveError && (
                <span className="inline-flex items-center gap-1 text-xs text-accent">
                  <Icon name="check" size={13} strokeWidth={2.25} /> Saved {savedAt}
                </span>
              )}
              {saveError && (
                <span className="inline-flex items-center gap-1 text-xs text-warn">
                  <Icon name="shield" size={13} strokeWidth={2.25} /> {saveError}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* how it works */}
        <Card>
          <PanelHeading title="How it works the lead" sub="Every inbound AI conversation, end to end" />
          <ol className="space-y-3">
            {[
              { icon: "bolt" as IconName, t: "Replies in seconds", d: `An AI shopper messages in — ${cfg.displayName} answers in ~${cfg.speedToLeadSec}s, day or night, before the lead goes cold.` },
              { icon: "messages" as IconName, t: "Answers anything", d: "Pricing, availability, trade, financing, hours — grounded in your live inventory feed, never guessing." },
              { icon: "calendar" as IconName, t: "Books the appointment", d: "Drives every qualified conversation to a set appointment or a started credit app." },
              { icon: "handoff" as IconName, t: "Hands off cleanly", d: cfg.handoffPhone ? `Loops in your team at ${cfg.handoffPhone} the moment a human should take over.` : "Loops in your team the moment a human should take over — add a handoff number to enable." },
              { icon: "chart" as IconName, t: "Attributes the sale", d: "Every booked appointment and sold car is credited back on your ROI page." },
            ].map((s, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-line bg-black/[0.02] p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet/15 text-violet ring-1 ring-inset ring-violet/20">
                  <Icon name={s.icon} size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{s.t}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}

type TestMsg = { id: number; role: "user" | "assistant"; text: string };

const TEST_CHIPS = [
  "Do you have a RAV4 under $30k?",
  "What's my trade-in worth?",
  "Can I get financing with less-than-perfect credit?",
];

/**
 * Test Ava live — message the assistant like a buyer and watch her answer in
 * real time (grounded in the dealer's inventory via /api/assistant), with
 * one-tap voice playback of any reply via /api/tts.
 */
function TestAva({ name, persona, greeting }: { name: string; persona: string; greeting: string }) {
  const [messages, setMessages] = useState<TestMsg[]>([
    { id: 0, role: "assistant", text: greeting.replace(/\{vehicle\}/gi, "2024 Nissan Rogue") },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const idRef = useRef(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(q: string) {
    const text = q.trim();
    if (!text || busy) return;
    setInput("");
    const userMsg: TestMsg = { id: idRef.current++, role: "user", text };
    const aId = idRef.current++;
    const history = [...messages, userMsg];
    setMessages([...history, { id: aId, role: "assistant", text: "" }]);
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history.map((m) => ({ role: m.role, content: m.text })) }),
      });
      if (!res.ok || !res.body) throw new Error("unreachable");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((m) => m.map((x) => (x.id === aId ? { ...x, text: acc } : x)));
      }
    } catch {
      setMessages((m) =>
        m.map((x) =>
          x.id === aId
            ? { ...x, text: "I'd love to help with that — give me a second and try again." }
            : x,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function speak(msg: TestMsg) {
    const a = audioRef.current;
    if (!a) return;
    if (speakingId === msg.id) {
      a.pause();
      a.currentTime = 0;
      setSpeakingId(null);
      return;
    }
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg.text, persona }),
      });
      if (!res.ok) return;
      const url = URL.createObjectURL(await res.blob());
      a.src = url;
      a.onended = () => setSpeakingId(null);
      setSpeakingId(msg.id);
      a.play().catch(() => setSpeakingId(null));
    } catch {
      setSpeakingId(null);
    }
  }

  return (
    <Card>
      <PanelHeading
        title={`Test ${name} live`}
        sub="Ask anything a buyer would — and hear exactly how your AI works the lead"
      />
      <div ref={scrollRef} className="max-h-[320px] space-y-3 overflow-y-auto pr-1 scroll-slim">
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-cyan px-3.5 py-2.5 text-sm text-ink-inverse">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan to-violet text-[11px] font-bold text-white">
                {name.charAt(0) || "A"}
              </span>
              <div className="min-w-0 max-w-[85%]">
                <div className="rounded-2xl rounded-tl-sm border border-line bg-black/[0.02] px-3.5 py-2.5 text-sm leading-relaxed text-ink-soft">
                  {m.text || <span className="text-ink-faint">…</span>}
                </div>
                {m.text && (
                  <button
                    onClick={() => speak(m)}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-ink-faint transition-colors hover:text-cyan"
                  >
                    <Icon name={speakingId === m.id ? "close" : "play"} size={11} strokeWidth={2.25} />
                    {speakingId === m.id ? "Stop" : "Hear it"}
                  </button>
                )}
              </div>
            </div>
          ),
        )}
      </div>

      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {TEST_CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => send(c)}
              className="rounded-full border border-line-strong bg-black/[0.02] px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-cyan/40 hover:text-ink"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 flex items-end gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${name} like a buyer…`}
          className="h-11 flex-1 rounded-xl border border-line-strong bg-black/[0.03] px-4 text-sm text-ink placeholder:text-ink-faint focus:border-cyan/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan text-ink-inverse transition-colors hover:bg-cyan/90 disabled:opacity-50"
        >
          <Icon name="arrow-right" size={18} strokeWidth={2.25} />
        </button>
      </form>
      <audio ref={audioRef} preload="none" />
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-soft">{label}</label>
      {children}
    </div>
  );
}
