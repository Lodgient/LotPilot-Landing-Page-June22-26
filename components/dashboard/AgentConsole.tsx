"use client";

import { useState } from "react";
import Icon, { type IconName } from "@/components/Icon";
import { Card, PanelHeading } from "@/components/dashboard/ui";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { AgentConfig, AgentPerformance } from "@/lib/dashboard/types";

const PERSONAS = [
  { id: "warm", label: "Warm & friendly" },
  { id: "concise", label: "Concise & direct" },
  { id: "luxury", label: "White-glove / luxury" },
];

const CHANNELS: { id: "sms" | "voice" | "chat"; label: string; icon: IconName }[] = [
  { id: "sms", label: "SMS / Text", icon: "messages" },
  { id: "voice", label: "Voice calls", icon: "reply" },
  { id: "chat", label: "Website chat", icon: "sparkles" },
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
  const [dirty, setDirty] = useState(false);

  function patch(p: Partial<AgentConfig>) {
    setCfg((c) => ({ ...c, ...p }));
    setDirty(true);
  }

  async function persist(next: AgentConfig) {
    setSaving(true);
    const supabase = createClient();
    // RLS scopes this to the caller's dealer; the .neq guard just gives the
    // update a WHERE clause so it targets the dealer's single row.
    await supabase
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

  return (
    <div className="space-y-6">
      {/* hero status */}
      <Card glow className="relative overflow-hidden">
        <div className="glow-cyan pointer-events-none absolute -right-10 -top-16 h-56 w-56 opacity-50" />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <span
              className={cn(
                "grid h-14 w-14 shrink-0 place-items-center rounded-2xl ring-1 ring-inset",
                live ? "bg-accent/15 text-accent ring-accent/25" : "bg-white/[0.05] text-ink-muted ring-line",
              )}
            >
              <Icon name="bolt" size={26} />
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
            </div>
          </div>
          <button
            onClick={toggleStatus}
            disabled={saving}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-60",
              live
                ? "border border-line-strong text-ink hover:border-warn/50 hover:bg-white/[0.04]"
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
        {[
          { label: "Leads worked", value: performance.leadsWorked.toLocaleString(), icon: "messages" as IconName },
          { label: "Appointments", value: performance.appts.toLocaleString(), icon: "calendar" as IconName },
          { label: "Credit apps", value: performance.creditApps.toLocaleString(), icon: "file" as IconName },
          { label: "Attributed sales", value: performance.attributedSales.toLocaleString(), icon: "check" as IconName },
          { label: "Attributed gross", value: money(performance.gross), icon: "chart" as IconName },
        ].map((s) => (
          <Card key={s.label} className="flex flex-col gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan/12 text-cyan ring-1 ring-inset ring-cyan/20">
              <Icon name={s.icon} size={16} />
            </span>
            <div>
              <div className="text-2xl font-bold tracking-tight text-ink">{s.value}</div>
              <div className="mt-0.5 text-xs text-ink-muted">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

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
                    onClick={() => patch({ persona: p.id })}
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
                          : "border-line bg-white/[0.02] text-ink-muted hover:text-ink",
                      )}
                    >
                      <Icon name={c.icon} size={15} className={on ? "text-accent" : ""} />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Opening message">
              <textarea
                value={cfg.greeting}
                onChange={(e) => patch({ greeting: e.target.value })}
                rows={3}
                className="input resize-none"
              />
              <p className="mt-1 text-[11px] text-ink-faint">
                Use <code className="text-ink-soft">{"{vehicle}"}</code> to drop in the car they asked about.
              </p>
            </Field>

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
              {savedAt && !dirty && (
                <span className="inline-flex items-center gap-1 text-xs text-accent">
                  <Icon name="check" size={13} strokeWidth={2.25} /> Saved {savedAt}
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
              <li key={i} className="flex gap-3 rounded-xl border border-line bg-white/[0.02] p-3">
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-soft">{label}</label>
      {children}
    </div>
  );
}
