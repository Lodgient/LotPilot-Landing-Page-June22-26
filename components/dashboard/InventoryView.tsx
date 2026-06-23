"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";
import { Card } from "@/components/dashboard/ui";
import { Sparkline } from "@/components/dashboard/charts";
import { ExportCsv } from "@/components/dashboard/Exports";
import LivePagePreview from "@/components/dashboard/LivePagePreview";
import { ENGINES, type Dealer, type Vehicle } from "@/lib/dashboard/types";
import { cn } from "@/lib/cn";

const money = (n: number) => "$" + n.toLocaleString();

function scoreColor(s: number) {
  if (s < 40) return "var(--color-danger)";
  if (s < 70) return "var(--color-warn)";
  return "var(--color-accent)";
}
function scoreTone(s: number): "danger" | "warn" | "accent" {
  return s < 40 ? "danger" : s < 70 ? "warn" : "accent";
}

type Filter = "all" | "invisible" | "aged" | "strong";
type SortKey = "ai" | "dol" | "leads" | "price";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All inventory" },
  { key: "invisible", label: "Invisible to AI" },
  { key: "aged", label: "Aged 45+ days" },
  { key: "strong", label: "Top performers" },
];

function EngineDots({ v }: { v: Vehicle }) {
  return (
    <div className="flex items-center gap-1" title={`${v.enginesCiting} of 5 engines`}>
      {ENGINES.map((e) => (
        <span
          key={e}
          className={cn(
            "h-2 w-2 rounded-full",
            v.engines[e] ? "bg-accent" : "bg-black/12",
          )}
        />
      ))}
    </div>
  );
}

export default function InventoryView({ vehicles, dealer }: { vehicles: Vehicle[]; dealer: Dealer }) {
  const sp = useSearchParams();
  const pathname = usePathname();
  const [filter, setFilter] = useState<Filter>(((sp.get("view") as Filter) ?? "all"));
  const [sort, setSort] = useState<SortKey>(((sp.get("sort") as SortKey) ?? "ai"));
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [active, setActive] = useState<Vehicle | null>(null);
  const [preview, setPreview] = useState<Vehicle | null>(null);
  const [copied, setCopied] = useState(false);

  function copyView() {
    const p = new URLSearchParams();
    p.set("view", filter);
    p.set("sort", sort);
    if (q.trim()) p.set("q", q.trim());
    const url = `${window.location.origin}${pathname}?${p.toString()}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const summary = useMemo(() => {
    const total = vehicles.length;
    const visible = vehicles.filter((v) => v.enginesCiting > 0).length;
    const dark = vehicles.filter((v) => v.aiScore < 40);
    const avg = total ? Math.round(vehicles.reduce((s, v) => s + v.aiScore, 0) / total) : 0;
    const leads = vehicles.reduce((s, v) => s + v.aiLeads, 0);
    const darkGross = dark.reduce((s, v) => s + v.estGross, 0);
    return { total, visible, pctVisible: total ? Math.round((visible / total) * 100) : 0, avg, leads, darkCount: dark.length, darkGross };
  }, [vehicles]);

  const rows = useMemo(() => {
    let list = vehicles;
    if (filter === "invisible") list = list.filter((v) => v.aiScore < 40);
    if (filter === "aged") list = list.filter((v) => v.daysOnLot >= 45);
    if (filter === "strong") list = list.filter((v) => v.aiScore >= 70);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((v) =>
        `${v.year} ${v.make} ${v.model} ${v.trim} ${v.vin}`.toLowerCase().includes(t),
      );
    }
    const sorted = [...list].sort((a, b) => {
      if (sort === "ai") return b.aiScore - a.aiScore;
      if (sort === "dol") return b.daysOnLot - a.daysOnLot;
      if (sort === "leads") return b.aiLeads - a.aiLeads;
      return b.price - a.price;
    });
    return sorted;
  }, [vehicles, filter, q, sort]);

  return (
    <div>
      {/* summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-ink-muted">Inventory AI-visible</p>
          <p className="mt-2 text-3xl font-bold text-ink">
            {summary.pctVisible}%
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">{summary.visible} of {summary.total} units surfaced</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-muted">Avg AI score</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: scoreColor(summary.avg) }}>
            {summary.avg}
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">across the lot</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-muted">AI-sourced leads</p>
          <p className="mt-2 text-3xl font-bold text-ink">{summary.leads}</p>
          <p className="mt-0.5 text-xs text-ink-muted">attributed to inventory</p>
        </Card>
        <Card className="ring-gradient">
          <p className="text-sm text-ink-muted">Gross sitting dark</p>
          <p className="mt-2 text-3xl font-bold text-danger">{money(summary.darkGross)}</p>
          <p className="mt-0.5 text-xs text-ink-muted">{summary.darkCount} units invisible to AI</p>
        </Card>
      </div>

      {/* invisible inventory callout */}
      {summary.darkCount > 0 && (
        <Card className="mt-6 border-danger/30 bg-danger/[0.04]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Icon name="radar" size={16} className="shrink-0 text-danger" />
                {summary.darkCount} cars match real demand but AI never shows them
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                That&apos;s roughly{" "}
                <span className="font-semibold text-danger">{money(summary.darkGross)}</span> in
                front gross AI can&apos;t route to you yet — LotPilot is already fixing these.
              </p>
            </div>
            <button
              onClick={() => setFilter("invisible")}
              className="inline-flex h-10 items-center rounded-full bg-cyan px-5 text-sm font-semibold text-ink-inverse transition-colors hover:bg-cyan/90"
            >
              Show invisible units →
            </button>
          </div>
        </Card>
      )}

      {/* controls */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3 py-2 text-xs font-medium transition-colors sm:py-1.5",
              filter === f.key
                ? "border-cyan/50 bg-cyan/10 text-cyan"
                : "border-line bg-black/[0.02] text-ink-muted hover:text-ink",
            )}
          >
            {f.label}
          </button>
        ))}
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search VIN / model…"
            className="h-9 w-full rounded-lg border border-line-strong bg-black/[0.03] px-3 text-sm text-ink placeholder:text-ink-faint focus:border-cyan/60 focus:outline-none sm:w-44"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 rounded-lg border border-line-strong bg-black/[0.03] px-2 text-sm text-ink focus:border-cyan/60 focus:outline-none"
          >
            <option value="ai" className="bg-panel">Sort: AI score</option>
            <option value="dol" className="bg-panel">Sort: Days on lot</option>
            <option value="leads" className="bg-panel">Sort: AI leads</option>
            <option value="price" className="bg-panel">Sort: Price</option>
          </select>
          <button
            onClick={copyView}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-strong bg-black/[0.03] px-3 text-sm text-ink-soft transition-colors hover:border-cyan/50 hover:text-ink"
          >
            {copied ? (
              <>
                <Icon name="check" size={14} /> Link copied
              </>
            ) : (
              <>
                <Icon name="link" size={14} /> Save view
              </>
            )}
          </button>
          <ExportCsv
            filename="lotpilot-inventory-ai.csv"
            columns={[
              { key: "vehicle", label: "Vehicle" },
              { key: "vin", label: "VIN" },
              { key: "stockType", label: "Stock" },
              { key: "price", label: "Price" },
              { key: "mileage", label: "Mileage" },
              { key: "daysOnLot", label: "Days on lot" },
              { key: "aiScore", label: "AI score" },
              { key: "enginesCiting", label: "Engines citing" },
              { key: "queriesMatched", label: "Queries matched" },
              { key: "aiLeads", label: "AI leads" },
              { key: "blocker", label: "Top fix" },
            ]}
            rows={rows.map((v) => ({
              vehicle: `${v.year} ${v.make} ${v.model} ${v.trim}`,
              vin: v.vin,
              stockType: v.stockType,
              price: v.price,
              mileage: v.mileage,
              daysOnLot: v.daysOnLot,
              aiScore: v.aiScore,
              enginesCiting: v.enginesCiting,
              queriesMatched: v.queriesMatched,
              aiLeads: v.aiLeads,
              blocker: v.blocker,
            }))}
          />
        </div>
      </div>

      {/* mobile cards */}
      <div className="mt-4 space-y-3 lg:hidden">
        {rows.map((v) => (
          <div
            key={v.id}
            onClick={() => setActive(v)}
            className="surface cursor-pointer rounded-2xl p-4 transition-colors hover:bg-black/[0.03]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">
                  {v.year} {v.make} {v.model} <span className="text-ink-muted">{v.trim}</span>
                </p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {v.stockType} · {v.mileage.toLocaleString()} mi · {v.vin}
                </p>
              </div>
              <span
                className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold tabular-nums"
                style={{ color: scoreColor(v.aiScore), background: "color-mix(in oklab," + scoreColor(v.aiScore) + " 14%, transparent)" }}
              >
                {v.aiScore}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-sm tabular-nums text-ink-soft">{money(v.price)}</span>
              <span className="text-xs text-ink-faint">{v.aiLeads} AI leads</span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              {v.blocker === "None" ? (
                <span className="inline-flex items-center gap-1 text-xs text-accent">
                  <Icon name="check" size={13} strokeWidth={2.25} /> Fully optimized
                </span>
              ) : (
                <span className="text-xs text-ink-muted">Top fix: {v.blocker}</span>
              )}
              {v.liveUrl && (
                <button
                  onClick={(e) => { e.stopPropagation(); setPreview(v); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink-muted transition-colors hover:border-cyan/50 hover:bg-cyan/10 hover:text-cyan"
                >
                  <Icon name="globe" size={14} /> AI page
                </button>
              )}
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="surface rounded-2xl p-6 text-center text-sm text-ink-muted">No vehicles match this view.</p>
        )}
      </div>

      {/* table */}
      <Card className="mt-4 hidden p-0 lg:block">
        <div className="overflow-x-auto scroll-slim">
          <table className="w-full min-w-[940px] border-collapse">
            <thead>
              <tr className="text-xs text-ink-faint">
                <th className="px-4 py-3 text-left font-medium">Vehicle</th>
                <th className="px-3 py-3 text-right font-medium">Price</th>
                <th className="px-3 py-3 text-center font-medium">Days</th>
                <th className="px-3 py-3 text-center font-medium">AI score</th>
                <th className="px-3 py-3 text-center font-medium">Engines</th>
                <th className="px-3 py-3 text-center font-medium">AI leads</th>
                <th className="px-3 py-3 text-left font-medium">Top fix</th>
                <th className="px-3 py-3 text-center font-medium">Trend</th>
                <th className="px-3 py-3 text-center font-medium">AI page</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => setActive(v)}
                  className="cursor-pointer border-t border-line transition-colors hover:bg-black/[0.03]"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-ink">
                      {v.year} {v.make} {v.model} <span className="text-ink-muted">{v.trim}</span>
                    </p>
                    <p className="text-xs text-ink-faint">
                      {v.stockType} · {v.mileage.toLocaleString()} mi · {v.vin}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-right text-sm tabular-nums text-ink-soft">{money(v.price)}</td>
                  <td className="px-3 py-3 text-center text-sm tabular-nums">
                    <span className={v.daysOnLot >= 45 ? "text-warn" : "text-ink-muted"}>{v.daysOnLot}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className="inline-grid h-8 w-8 place-items-center rounded-lg text-sm font-bold tabular-nums"
                      style={{ color: scoreColor(v.aiScore), background: "color-mix(in oklab," + scoreColor(v.aiScore) + " 14%, transparent)" }}
                    >
                      {v.aiScore}
                    </span>
                  </td>
                  <td className="px-3 py-3"><div className="flex justify-center"><EngineDots v={v} /></div></td>
                  <td className="px-3 py-3 text-center text-sm tabular-nums text-ink-soft">{v.aiLeads}</td>
                  <td className="px-3 py-3">
                    {v.blocker === "None" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-accent"><Icon name="check" size={13} strokeWidth={2.25} /> Fully optimized</span>
                    ) : (
                      <span className="text-xs text-ink-muted">{v.blocker}</span>
                    )}
                  </td>
                  <td className="px-3 py-3"><div className="flex justify-center"><Sparkline data={v.trend} accent={scoreTone(v.aiScore)} width={72} height={26} /></div></td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreview(v); }}
                        title="View this car's live LotPilot AI page"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-muted transition-colors hover:border-cyan/50 hover:bg-cyan/10 hover:text-cyan"
                      >
                        <Icon name="globe" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="p-6 text-center text-sm text-ink-muted">No vehicles match this view.</p>
        )}
      </Card>

      {/* drill-down modal */}
      {active && (
        <VehicleDetail
          vehicle={active}
          onClose={() => setActive(null)}
          onViewPage={() => setPreview(active)}
        />
      )}

      {/* live AI page preview */}
      {preview && (
        <LivePagePreview dealer={dealer} vehicle={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}

function VehicleDetail({
  vehicle: v,
  onClose,
  onViewPage,
}: {
  vehicle: Vehicle;
  onClose: () => void;
  onViewPage: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="relative h-full w-full max-w-lg overflow-y-auto border-l border-line bg-canvas p-6 scroll-slim sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">
              {v.year} {v.make} {v.model} {v.trim}
            </h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              {v.stockType} · {v.mileage.toLocaleString()} mi · {money(v.price)} · {v.vin}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-muted hover:text-ink"
          >
            ✕
          </button>
        </div>

        <button
          onClick={onViewPage}
          className="mt-5 flex w-full items-center gap-3 rounded-xl border border-cyan/30 bg-cyan/[0.06] px-4 py-3 text-left transition-colors hover:bg-cyan/10"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan/15 text-cyan ring-1 ring-inset ring-cyan/20">
            <Icon name="globe" size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-ink">View this car&apos;s live AI page</span>
            <span className="block truncate text-xs text-ink-muted">
              The answer-engine page LotPilot publishes for this VIN
            </span>
          </span>
          <Icon name="arrow-right" size={16} className="shrink-0 text-cyan" />
        </button>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="AI score" value={String(v.aiScore)} color={scoreColor(v.aiScore)} />
          <Metric label="AI leads" value={String(v.aiLeads)} />
          <Metric label="AI VDP views" value={v.aiVdpViews.toLocaleString()} />
          <Metric label="Engines citing" value={`${v.enginesCiting}/5`} />
          <Metric label="Queries matched" value={String(v.queriesMatched)} />
          <Metric label="Days on lot" value={String(v.daysOnLot)} />
        </div>

        <div className="mt-6">
          <p className="mb-2 text-xs uppercase tracking-wider text-ink-faint">90-day AI trend</p>
          <div className="rounded-xl border border-line bg-black/[0.02] p-3">
            <Sparkline data={v.trend} accent={scoreTone(v.aiScore)} width={420} height={56} />
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-xs uppercase tracking-wider text-ink-faint">
            Where this car shows up
          </p>
          <div className="space-y-3">
            {v.citations.map((c, i) => (
              <div key={i} className="rounded-xl border border-line bg-black/[0.02] p-3">
                <p className="font-mono text-xs text-ink-muted">&ldquo;{c.query}&rdquo;</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {ENGINES.map((e) => (
                    <span
                      key={e}
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[11px]",
                        c.engines[e]
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-line bg-black/[0.02] text-ink-faint line-through",
                      )}
                    >
                      {e.replace(" AI Overviews", " AIO").replace("Bing ", "")}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-ink-faint">
                  Top source AI shows:{" "}
                  <span className={c.topSource === "Your VDP" ? "text-accent" : "text-danger"}>
                    {c.topSource}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-cyan/30 bg-cyan/[0.06] p-4">
          <p className="text-sm font-semibold text-ink">
            {v.blocker === "None" ? "✓ This unit is fully optimized" : `LotPilot is fixing this · ${v.blocker}`}
          </p>
          {v.blocker !== "None" && (
            <>
              <p className="mt-1 text-sm text-ink-muted">{fixCopy(v.blocker)}</p>
              <span className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 px-4 text-xs font-semibold text-cyan">
                <Icon name="bolt" size={13} strokeWidth={2.25} /> Auto-applying — nothing for you to do
              </span>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-line bg-black/[0.02] p-3 text-center">
      <p className="text-xl font-bold tabular-nums" style={color ? { color } : undefined}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-ink-muted">{label}</p>
    </div>
  );
}

function fixCopy(blocker: string): string {
  switch (blocker) {
    case "No schema":
      return "Publish machine-readable Vehicle schema so AI can read price, trim, VIN and availability. LotPilot does this automatically.";
    case "Stale freshness":
      return "Push live price/availability updates to the sources AI reads so this unit stops showing as stale.";
    case "Not citable VDP":
      return "Generate an AI-citable detail page for this VIN that answer engines can reference directly.";
    case "Priced above AI cut":
      return "This unit sits just above the price band AI surfaces for its query — a small adjustment unlocks visibility.";
    case "Thin photos":
      return "Add more photos — AI deprioritizes listings with fewer than six images.";
    default:
      return "Optimize this listing for AI discovery.";
  }
}
