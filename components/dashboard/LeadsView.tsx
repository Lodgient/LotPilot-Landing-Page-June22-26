"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
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

export default function LeadsView({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [activeId, setActiveId] = useState<string>(leads[0]?.id ?? "");
  const [tookOver, setTookOver] = useState(false);

  const list = leads.filter((l) => matches(l, filter));
  const active = leads.find((l) => l.id === activeId) ?? list[0] ?? leads[0];

  if (!active) {
    return <p className="text-sm text-ink-muted">No leads yet.</p>;
  }

  return (
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
                  : "border-line bg-white/[0.02] text-ink-muted hover:text-ink",
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
              onClick={() => {
                setActiveId(l.id);
                setTookOver(false);
              }}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition-colors",
                l.id === active.id
                  ? "border-cyan/50 bg-cyan/[0.06]"
                  : "border-line bg-white/[0.02] hover:border-line-strong hover:bg-white/[0.04]",
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
              </div>
            </button>
          ))}
          {list.length === 0 && (
            <p className="rounded-xl border border-line bg-white/[0.02] p-4 text-sm text-ink-muted">
              No leads match this filter.
            </p>
          )}
        </div>
      </div>

      {/* Conversation */}
      <Card className="flex min-h-[520px] flex-col p-0">
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
            <Badge tone="cyan"><Icon name="bolt" size={12} /> {active.firstReplySec}s first reply</Badge>
            <Badge tone={active.status === "Appointment booked" ? "accent" : "neutral"}>
              {active.status}
            </Badge>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5 scroll-slim">
          {active.transcript.map((m, i) => {
            const mine = m.from !== "buyer";
            return (
              <div key={i} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div className="max-w-[78%]">
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm",
                      m.from === "buyer" &&
                        "rounded-tl-sm border border-line bg-white/[0.04] text-ink-soft",
                      m.from === "agent" &&
                        "rounded-tr-sm border border-cyan/30 bg-cyan/[0.08] text-ink",
                      m.from === "rep" &&
                        "rounded-tr-sm border border-violet/30 bg-violet/[0.12] text-ink",
                    )}
                  >
                    {m.text}
                  </div>
                  <p className={cn("mt-1 text-[11px] text-ink-faint", mine ? "text-right" : "text-left")}>
                    {m.from === "agent" ? "AI agent" : m.from === "rep" ? "You" : active.name.split(" ")[0]} ·{" "}
                    {m.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-line p-4">
          {tookOver ? (
            <div className="flex items-center gap-2">
              <input
                placeholder="Type a message to the buyer…"
                className="h-11 flex-1 rounded-xl border border-line-strong bg-white/[0.03] px-4 text-sm text-ink placeholder:text-ink-faint focus:border-cyan/60 focus:outline-none"
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
                className="h-10 rounded-full border border-line-strong px-4 text-sm font-medium text-ink transition-colors hover:border-cyan/50 hover:bg-white/[0.04]"
              >
                Take over
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
