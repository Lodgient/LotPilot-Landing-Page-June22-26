"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/Icon";
import { Badge } from "./ui";
import { createClient } from "@/lib/supabase/client";
import type { Recommendation } from "@/lib/dashboard/types";

const PRIORITY_TONE: Record<string, "danger" | "warn" | "neutral"> = {
  High: "danger",
  Medium: "warn",
  Low: "neutral",
};

type State = "open" | "applying" | "applied";

// Parse "$8.1k", "$1,200" etc. from an impact string into a dollar number.
function parseDollars(s: string): number {
  const k = s.match(/\$\s*([\d.]+)\s*k/i);
  if (k) return Math.round(parseFloat(k[1]) * 1000);
  const n = s.match(/\$\s*([\d,]+)/);
  return n ? parseInt(n[1].replace(/,/g, ""), 10) : 0;
}
function parseLeads(s: string): number {
  const m = s.match(/\+\s*(\d+)\s*AI leads/i);
  return m ? parseInt(m[1], 10) : 0;
}
function money(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;
}

function applyOne(id: string) {
  const supabase = createClient();
  return supabase
    .from("dp_recommendations")
    .update({ status: "applied", applied_at: new Date().toISOString() })
    .eq("id", id);
}

function Item({
  r,
  state,
  onApply,
}: {
  r: Recommendation;
  state: State;
  onApply: (id: string) => void;
}) {
  const auto = r.effort.toLowerCase() === "automatic";
  return (
    <li className="rounded-xl border border-line bg-white/[0.02] p-4 transition-colors hover:border-cyan/30">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={PRIORITY_TONE[r.priority]}>{r.priority}</Badge>
        <span className="text-xs text-ink-faint">{r.category}</span>
        <span className="ml-auto rounded-md bg-accent/12 px-2 py-0.5 text-xs font-medium text-accent">
          {r.impact}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-ink">{r.title}</p>
      <p className="mt-1 text-sm text-ink-muted">{r.detail}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[11px] text-ink-muted">
          {auto && <Icon name="bolt" size={11} strokeWidth={2} />}
          {auto ? "Automatic · ~30s" : `Effort: ${r.effort}`}
        </span>
        {state === "applied" ? (
          <span className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-4 text-xs font-semibold text-accent">
            <Icon name="check" size={14} strokeWidth={2.25} /> Queued for LotPilot
          </span>
        ) : (
          <button
            onClick={() => onApply(r.id)}
            disabled={state === "applying"}
            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full bg-cyan px-4 text-xs font-semibold text-ink-inverse transition-colors hover:bg-cyan/90 disabled:opacity-60"
          >
            {state === "applying" ? (
              "Applying…"
            ) : (
              <>
                Apply with LotPilot <Icon name="arrow-right" size={14} strokeWidth={2.25} />
              </>
            )}
          </button>
        )}
      </div>
    </li>
  );
}

export default function Recommendations({ items }: { items: Recommendation[] }) {
  const [states, setStates] = useState<Record<string, State>>(() =>
    Object.fromEntries(items.map((r) => [r.id, r.status === "applied" ? "applied" : "open"])),
  );

  const totals = useMemo(() => {
    const dollars = items.reduce((s, r) => s + parseDollars(r.impact), 0);
    const leads = items.reduce((s, r) => s + parseLeads(r.impact), 0);
    return { dollars, leads };
  }, [items]);

  const openIds = items.filter((r) => states[r.id] !== "applied").map((r) => r.id);
  const allApplied = openIds.length === 0;

  function setState(id: string, s: State) {
    setStates((prev) => ({ ...prev, [id]: s }));
  }

  async function apply(id: string) {
    setState(id, "applying");
    await applyOne(id); // demo: surface as queued regardless of RLS write result
    setState(id, "applied");
  }

  function applyAll() {
    // Optimistic: queue every open fix at once.
    openIds.forEach((id) => {
      setState(id, "applied");
      void applyOne(id);
    });
  }

  return (
    <div>
      {/* Aggregate bar */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-cyan/20 bg-cyan/[0.05] px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">
            {items.length} fixes ·{" "}
            <span className="text-gradient">
              {money(totals.dollars)} gross
              {totals.leads ? ` + ${totals.leads} AI leads/mo` : ""}
            </span>{" "}
            on the table
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">
            Most apply automatically — no work for your team.
          </p>
        </div>
        {!allApplied ? (
          <button
            onClick={applyAll}
            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full bg-cyan px-4 text-xs font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan/90 cta-glow"
          >
            Apply all <Icon name="arrow-right" size={14} strokeWidth={2.25} />
          </button>
        ) : (
          <span className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-4 text-xs font-semibold text-accent">
            <Icon name="check" size={14} strokeWidth={2.25} /> All queued
          </span>
        )}
      </div>

      <ul className="space-y-3">
        {items.map((r) => (
          <Item key={r.id} r={r} state={states[r.id] ?? "open"} onApply={apply} />
        ))}
      </ul>
    </div>
  );
}
