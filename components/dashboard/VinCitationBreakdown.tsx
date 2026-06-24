"use client";

import { useMemo, useState } from "react";
import { Card, PanelHeading, Badge } from "@/components/dashboard/ui";
import { ENGINES, type EngineName, type Vehicle } from "@/lib/dashboard/types";
import { cn } from "@/lib/cn";

const SHORT = (e: string) => e.replace(" AI Overviews", " AIO").replace("Bing ", "");
const money = (n: number) => "$" + n.toLocaleString();

type Filter = "dark" | "cited" | "all";

const scoreColor = (s: number) =>
  s >= 70 ? "var(--color-accent)" : s >= 40 ? "var(--color-cyan)" : "var(--color-danger)";

export default function VinCitationBreakdown({
  vehicles,
  dealerName,
}: {
  vehicles: Vehicle[];
  dealerName: string;
}) {
  const [filter, setFilter] = useState<Filter>("dark");
  const [open, setOpen] = useState<string | null>(null);

  const cited = vehicles.filter((v) => v.enginesCiting > 0).length;
  const dark = vehicles.length - cited;

  // Worst-first within each filter so the actionable gaps surface at the top.
  const list = useMemo(() => {
    const f = vehicles.filter((v) =>
      filter === "all" ? true : filter === "cited" ? v.enginesCiting > 0 : v.enginesCiting === 0,
    );
    return [...f].sort((a, b) => a.enginesCiting - b.enginesCiting || a.aiScore - b.aiScore);
  }, [vehicles, filter]);

  // Who AI cites instead, aggregated across the dark units (the "who's winning your buyers").
  const stealing = useMemo(() => {
    const m = new Map<string, number>();
    for (const v of vehicles) {
      if (v.enginesCiting > 0) continue;
      for (const c of v.citations ?? []) {
        if (c.topSource && c.topSource !== dealerName) m.set(c.topSource, (m.get(c.topSource) ?? 0) + 1);
      }
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [vehicles, dealerName]);

  const FILTERS: { key: Filter; label: string; count: number }[] = [
    { key: "dark", label: "Dark to AI", count: dark },
    { key: "cited", label: "Cited", count: cited },
    { key: "all", label: "All inventory", count: vehicles.length },
  ];

  return (
    <Card className="mt-6">
      <PanelHeading
        title="Inventory citation breakdown"
        sub="Which exact VINs AI cites — and who it names instead, per engine & query"
      />

      {/* filter pills */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors",
              filter === f.key
                ? "bg-cyan/10 text-cyan ring-cyan/30"
                : "bg-black/[0.02] text-ink-soft ring-line hover:text-ink",
            )}
          >
            {f.label}
            <span
              className={cn(
                "rounded-full px-1.5 text-[10px] tabular-nums",
                filter === f.key ? "bg-cyan/15 text-cyan" : "bg-black/[0.05] text-ink-muted",
              )}
            >
              {f.count}
            </span>
          </button>
        ))}
        {stealing.length > 0 && (
          <p className="ml-auto hidden text-xs text-ink-muted sm:block">
            AI keeps naming{" "}
            <span className="font-medium text-danger">{stealing.map(([n]) => n).join(", ")}</span>
          </p>
        )}
      </div>

      {/* VIN rows */}
      <div className="space-y-2">
        {list.length === 0 && (
          <p className="rounded-xl border border-line bg-black/[0.02] p-4 text-center text-sm text-ink-muted">
            No vehicles in this view.
          </p>
        )}
        {list.map((v) => {
          const isOpen = open === v.id;
          const title = `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ""}`;
          return (
            <div
              key={v.id}
              className={cn(
                "overflow-hidden rounded-xl border transition-colors",
                isOpen ? "border-cyan/40 bg-cyan/[0.02]" : "border-line bg-black/[0.02]",
              )}
            >
              <button
                onClick={() => setOpen(isOpen ? null : v.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 p-3.5 text-left"
              >
                {/* AI score chip */}
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold tabular-nums text-white"
                  style={{ background: scoreColor(v.aiScore) }}
                >
                  {v.aiScore}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{title}</p>
                  <p className="truncate text-xs text-ink-muted">
                    {money(v.price)} · {v.stockType} · {v.queriesMatched} buyer queries matched
                  </p>
                </div>

                {/* per-engine dots */}
                <div className="hidden items-center gap-1.5 sm:flex" aria-label="Cited by engine">
                  {ENGINES.map((e) => {
                    const on = !!v.engines[e as EngineName];
                    return (
                      <span
                        key={e}
                        title={`${SHORT(e)}: ${on ? "cited" : "not cited"}`}
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          on ? "bg-accent" : "bg-danger/25 ring-1 ring-inset ring-danger/30",
                        )}
                      />
                    );
                  })}
                </div>

                <span className="ml-1 shrink-0">
                  {v.enginesCiting > 0 ? (
                    <Badge tone="accent">{v.enginesCiting}/{ENGINES.length} engines</Badge>
                  ) : (
                    <Badge tone="danger">Invisible</Badge>
                  )}
                </span>

                <span
                  aria-hidden
                  className={cn(
                    "shrink-0 text-xs leading-none text-ink-faint transition-transform",
                    isOpen && "rotate-180",
                  )}
                >
                  ▾
                </span>
              </button>

              {/* expanded: per-query × per-engine detail */}
              {isOpen && (
                <div className="border-t border-line px-3.5 py-3">
                  {v.blocker && (
                    <p className="mb-3 flex items-start gap-2 rounded-lg border border-warn/30 bg-warn/[0.06] p-2.5 text-xs text-ink-soft">
                      <span
                        aria-hidden
                        className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-warn/20 text-[9px] font-bold text-warn"
                      >
                        !
                      </span>
                      <span>
                        <span className="font-medium text-ink">Blocker:</span> {v.blocker}
                      </span>
                    </p>
                  )}
                  {(v.citations ?? []).length === 0 ? (
                    <p className="text-xs text-ink-muted">
                      No buyer queries matched this VIN yet.
                    </p>
                  ) : (
                    <ul className="space-y-2.5">
                      {(v.citations ?? []).map((c) => {
                        const youWin = c.topSource === dealerName;
                        return (
                          <li
                            key={c.query}
                            className="rounded-lg border border-line bg-panel p-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-medium text-ink">&ldquo;{c.query}&rdquo;</p>
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                                  youWin
                                    ? "bg-accent/12 text-accent"
                                    : "bg-danger/10 text-danger",
                                )}
                              >
                                {youWin ? "You're cited" : `AI names: ${c.topSource}`}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {ENGINES.map((e) => {
                                const on = !!c.engines[e];
                                return (
                                  <span
                                    key={e}
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px]",
                                      on
                                        ? "bg-accent/10 text-accent"
                                        : "bg-black/[0.03] text-ink-faint",
                                    )}
                                  >
                                    {on ? "✓" : "✕"} {SHORT(e)}
                                  </span>
                                );
                              })}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-ink-faint">
        Each VIN is rebuilt as an AI-readable page, then tested against the buyer queries it should
        win. Green = cited · red = a gap LotPilot is closing. Nothing for your team to do.
      </p>
    </Card>
  );
}
