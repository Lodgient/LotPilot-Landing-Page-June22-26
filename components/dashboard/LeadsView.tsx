"use client";

import { useEffect, useRef, useState } from "react";
import Icon, { type IconName } from "@/components/Icon";
import { Card, Badge } from "@/components/dashboard/ui";
import type { Lead, LeadTemp } from "@/lib/dashboard/types";
import { cn } from "@/lib/cn";

const TEMP_TONE: Record<LeadTemp, "danger" | "warn" | "neutral"> = {
  Hot: "danger",
  Warm: "warn",
  Cold: "neutral",
};

const FILTERS = ["All", "Hot", "Credit app", "Appointments"] as const;
type Filter = (typeof FILTERS)[number];

function matches(lead: Lead, f: Filter) {
  if (f === "All") return true;
  if (f === "Hot") return lead.temp === "Hot";
  if (f === "Credit app") return lead.creditApp;
  if (f === "Appointments") return lead.status === "Appointment booked";
  return true;
}

const TILE_TONE: Record<string, string> = {
  cyan: "bg-cyan/12 text-cyan",
  accent: "bg-accent/12 text-accent",
  violet: "bg-violet/15 text-violet",
  warn: "bg-warn/12 text-warn",
};

function StatTile({
  icon,
  value,
  label,
  tone,
}: {
  icon: IconName;
  value: string | number;
  label: string;
  tone: keyof typeof TILE_TONE;
}) {
  return (
    <Card className="flex items-center gap-3">
      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", TILE_TONE[tone])}>
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold tabular-nums text-ink">{value}</p>
        <p className="text-xs text-ink-muted">{label}</p>
      </div>
    </Card>
  );
}

function Outcome({ ok, icon, label }: { ok: boolean; icon: IconName; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        ok ? "text-accent" : "text-ink-faint",
      )}
    >
      <Icon name={ok ? "check" : icon} size={13} strokeWidth={2.25} />
      {label}
    </span>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="pulse-dot h-1.5 w-1.5 rounded-full bg-ink-faint"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

export default function LeadsView({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [activeId, setActiveId] = useState<string>(leads[0]?.id ?? "");
  const [tookOver, setTookOver] = useState(false);

  // replay state
  const [replaying, setReplaying] = useState(false);
  const [shown, setShown] = useState<number>(leads[0]?.transcript.length ?? 0);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const list = leads.filter((l) => matches(l, filter));
  const active = leads.find((l) => l.id === activeId) ?? list[0] ?? leads[0];

  // drive the replay (or show the full thread when not replaying)
  useEffect(() => {
    clearTimers();
    if (!active) return;
    if (!replaying) {
      setShown(active.transcript.length);
      setTyping(false);
      return;
    }
    setShown(0);
    setTyping(false);
    let i = 0;
    const run = () => {
      if (i >= active.transcript.length) {
        setReplaying(false);
        setTyping(false);
        return;
      }
      const msg = active.transcript[i];
      setTyping(true);
      const delay = msg.from === "buyer" ? 650 : 850;
      timers.current.push(
        setTimeout(() => {
          setTyping(false);
          setShown(i + 1);
          i += 1;
          timers.current.push(setTimeout(run, 460));
        }, delay),
      );
    };
    timers.current.push(setTimeout(run, 280));
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replaying, active?.id]);

  useEffect(() => () => clearTimers(), []);

  // keep the thread scrolled to the newest message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [shown, typing, active?.id]);

  if (!active) {
    return <p className="text-sm text-ink-muted">No leads yet.</p>;
  }

  function selectLead(id: string) {
    setReplaying(false);
    setActiveId(id);
    setTookOver(false);
  }

  const stats = {
    worked: leads.length,
    avgSpeed: leads.length
      ? Math.round(leads.reduce((s, l) => s + l.firstReplySec, 0) / leads.length)
      : 0,
    appts: leads.filter((l) => l.status === "Appointment booked").length,
    credit: leads.filter((l) => l.creditApp).length,
  };

  const firstAgentIdx = active.transcript.findIndex((m) => m.from === "agent");
  const next = active.transcript[shown];

  return (
    <div>
      {/* what your AI did */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon="messages" value={stats.worked} label="Leads worked" tone="cyan" />
        <StatTile icon="bolt" value={`${stats.avgSpeed}s`} label="Avg speed-to-lead" tone="accent" />
        <StatTile icon="calendar" value={stats.appts} label="Appointments booked" tone="violet" />
        <StatTile icon="file" value={stats.credit} label="Credit apps captured" tone="warn" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* List */}
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-medium transition-colors sm:py-1.5",
                  filter === f
                    ? "border-cyan/50 bg-cyan/10 text-cyan"
                    : "border-line bg-black/[0.02] text-ink-muted hover:text-ink",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {list.map((l) => (
              <button
                key={l.id}
                onClick={() => selectLead(l.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-colors",
                  l.id === active.id
                    ? "border-cyan/50 bg-cyan/[0.06]"
                    : "border-line bg-black/[0.02] hover:border-line-strong hover:bg-black/[0.04]",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet/20 text-xs font-semibold text-violet">
                    {l.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-ink">{l.name}</p>
                      <span className="shrink-0 text-[11px] text-ink-faint">{l.time}</span>
                    </div>
                    <p className="truncate text-xs text-ink-muted">{l.vehicle}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge tone={TEMP_TONE[l.temp]}>{l.temp}</Badge>
                  <span className="text-[11px] text-ink-faint">via {l.source}</span>
                  {l.creditApp && <span className="text-[11px] text-warn">· credit app</span>}
                  {l.status === "Appointment booked" && (
                    <span className="text-[11px] text-accent">· booked</span>
                  )}
                </div>
              </button>
            ))}
            {list.length === 0 && (
              <p className="rounded-xl border border-line bg-black/[0.02] p-4 text-sm text-ink-muted">
                No leads match this filter.
              </p>
            )}
          </div>
        </div>

        {/* Conversation */}
        <Card className="flex min-h-[560px] flex-col p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-violet/20 text-sm font-semibold text-violet">
                {active.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <div>
                <p className="text-base font-semibold text-ink">{active.name}</p>
                <p className="text-xs text-ink-muted">
                  {active.vehicle} · via {active.source}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setReplaying(true)}
                disabled={replaying}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 px-3.5 text-xs font-semibold text-cyan transition-colors hover:bg-cyan/15 disabled:opacity-60"
              >
                <Icon name="play" size={13} /> {replaying ? "Replaying…" : "Replay"}
              </button>
              <Badge tone={active.status === "Appointment booked" ? "accent" : "neutral"}>
                {active.status}
              </Badge>
            </div>
          </div>

          {/* outcome strip — what the AI achieved on this lead */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-b border-line bg-black/[0.02] px-5 py-2.5">
            <Outcome ok icon="bolt" label={`Replied in ${active.firstReplySec}s`} />
            <Outcome ok icon="search" label="Buyer qualified" />
            <Outcome
              ok={active.creditApp}
              icon="file"
              label={active.creditApp ? "Credit app captured" : "No credit app"}
            />
            <Outcome
              ok={active.status === "Appointment booked"}
              icon="calendar"
              label={active.status === "Appointment booked" ? "Appointment booked" : "No appt yet"}
            />
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5 scroll-slim">
            {active.transcript.slice(0, shown).map((m, i) => {
              const mine = m.from !== "buyer";
              return (
                <div key={i} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div className="max-w-[78%]">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm",
                        m.from === "buyer" &&
                          "rounded-tl-sm border border-line bg-black/[0.04] text-ink-soft",
                        m.from === "agent" &&
                          "rounded-tr-sm border border-cyan/30 bg-cyan/[0.08] text-ink",
                        m.from === "rep" &&
                          "rounded-tr-sm border border-violet/30 bg-violet/[0.12] text-ink",
                      )}
                    >
                      {m.text}
                    </div>
                    <p
                      className={cn(
                        "mt-1 flex items-center gap-1.5 text-[11px] text-ink-faint",
                        mine ? "justify-end" : "justify-start",
                      )}
                    >
                      {m.from === "agent" ? "AI agent" : m.from === "rep" ? "You" : active.name.split(" ")[0]} ·{" "}
                      {m.time}
                      {i === firstAgentIdx && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-1.5 py-0.5 font-medium text-accent">
                          <Icon name="bolt" size={10} strokeWidth={2.5} /> {active.firstReplySec}s
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* live typing indicator during replay */}
            {replaying && typing && next && (
              <div className={cn("flex", next.from !== "buyer" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3",
                    next.from === "buyer"
                      ? "rounded-tl-sm border border-line bg-black/[0.04]"
                      : next.from === "agent"
                        ? "rounded-tr-sm border border-cyan/30 bg-cyan/[0.08]"
                        : "rounded-tr-sm border border-violet/30 bg-violet/[0.12]",
                  )}
                >
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-line p-4">
            {tookOver ? (
              <div className="flex items-center gap-2">
                <input
                  placeholder="Type a message to the buyer…"
                  className="h-11 flex-1 rounded-xl border border-line-strong bg-black/[0.03] px-4 text-sm text-ink placeholder:text-ink-faint focus:border-cyan/60 focus:outline-none"
                />
                <button className="h-11 rounded-xl bg-cyan px-5 text-sm font-semibold text-ink-inverse hover:bg-cyan/90">
                  Send
                </button>
                <button
                  onClick={() => setTookOver(false)}
                  className="h-11 rounded-xl border border-line px-4 text-sm text-ink-muted hover:text-ink"
                >
                  Hand back to AI
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-ink-muted">
                  <span className="pulse-dot h-2 w-2 rounded-full bg-accent" />
                  AI agent is handling this conversation
                </span>
                <button
                  onClick={() => setTookOver(true)}
                  className="h-10 rounded-full border border-line-strong px-4 text-sm font-medium text-ink transition-colors hover:border-cyan/50 hover:bg-black/[0.04]"
                >
                  Take over
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
