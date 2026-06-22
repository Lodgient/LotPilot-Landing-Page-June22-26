"use client";

import { useState } from "react";
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

function Item({ r }: { r: Recommendation }) {
  const [state, setState] = useState<State>(r.status === "applied" ? "applied" : "open");

  async function apply() {
    setState("applying");
    const supabase = createClient();
    const { error } = await supabase
      .from("dp_recommendations")
      .update({ status: "applied", applied_at: new Date().toISOString() })
      .eq("id", r.id);
    setState(error ? "open" : "applied");
  }

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
      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-md border border-line px-2 py-1 text-[11px] text-ink-muted">
          Effort: {r.effort}
        </span>
        {state === "applied" ? (
          <span className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-4 text-xs font-semibold text-accent">
            <Icon name="check" size={14} strokeWidth={2.25} /> Queued for LotPilot
          </span>
        ) : (
          <button
            onClick={apply}
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
  return (
    <ul className="space-y-3">
      {items.map((r) => (
        <Item key={r.id} r={r} />
      ))}
    </ul>
  );
}
