"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";
import { Card, StatCard } from "@/components/dashboard/ui";
import { Sparkline } from "@/components/dashboard/charts";
import { ExportCsv } from "@/components/dashboard/Exports";
import LivePagePreview from "@/components/dashboard/LivePagePreview";
import {
  ENGINES,
  type Dealer,
  type Vehicle,
  type KPI,
  type EngineName,
} from "@/lib/dashboard/types";
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

// Front gross still on the table until this unit is fully AI-visible.
function oppOf(v: Vehicle) {
  return Math.max(0, Math.round(v.estGross * (1 - v.aiScore / 100)));
}
// A car real buyers are searching for in-market.
const inDemand = (v: Vehicle) => v.queriesMatched >= 4;

// Build a gently-rising (or falling) series ending at the current value, for KPI sparklines.
function rampUp(end: number, n = 9, factor = 0.8) {
  const start = Math.max(0, Math.round(end * factor));
  return Array.from({ length: n }, (_, i) => Math.round(start + (end - start) * (i / (n - 1))));
}
function rampDown(end: number, n = 9, factor = 1.55) {
  const start = Math.round(end * factor);
  return Array.from({ length: n }, (_, i) => Math.round(start + (end - start) * (i / (n - 1))));
}
function trendPct(series: number[]) {
  const a = series[0] || 1;
  const b = series[series.length - 1];
  return Math.round(((b - a) / Math.max(1, a)) * 100);
}

/** Compact ring gauge for an AI score (0–100) — CSS conic-gradient, cheap per-row. */
function ScoreGauge({ score, size = 36 }: { score: number; size?: number }) {
  const c = scoreColor(score);
  const inner = size - 8;
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${c} ${score}%, color-mix(in oklab, ${c} 16%, transparent) 0)`,
      }}
      title={`AI score ${score}/100`}
    >
      <span
        className="grid place-items-center rounded-full bg-panel text-[13px] font-bold tabular-nums"
        style={{ width: inner, height: inner, color: c }}
      >
        {score}
      </span>
    </span>
  );
}

/** Vehicle thumbnail — uses the live image if it loads, else a clean car-icon tile. */
function Thumb({ v, className }: { v: Vehicle; className?: string }) {
  const [err, setErr] = useState(false);
  const show = v.liveImage && !err;
  return (
    <span
      className={cn(
        "grid h-10 w-14 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-canvas-2",
        className,
      )}
    >
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={v.liveImage}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setErr(true)}
        />
      ) : (
        <Icon name="car" size={18} className="text-ink-faint" />
      )}
    </span>
  );
}

type Filter = "all" | "invisible" | "aged" | "strong";
type SortKey = "ai" | "dol" | "leads" | "price" | "opp";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All inventory" },
  { key: "invisible", label: "Invisible to AI" },
  { key: "aged", label: "Aged 45+ days" },
  { key: "strong", label: "Top performers" },
];

function EngineDots({ v }: { v: Vehicle }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${v.enginesCiting} of 5 engines`}>
      {ENGINES.map((e) => (
        <span
          key={e}
          title={`${e}: ${v.engines[e] ? "cited ✓" : "not cited"}`}
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

  const kpiCards = useMemo<KPI[]>(() => {
    const len = vehicles[0]?.trend?.length ?? 0;
    const avgSpark = len
      ? Array.from({ length: len }, (_, i) =>
          Math.round(
            vehicles.reduce((s, v) => s + (v.trend[i] ?? v.aiScore), 0) /
              Math.max(1, vehicles.length),
          ))
      : rampUp(summary.avg);
    const visSpark = rampUp(summary.pctVisible);
    const leadSpark = rampUp(summary.leads);
    const darkSpark = rampDown(summary.darkGross);
    return [
      { label: "Inventory AI-visible", value: `${summary.pctVisible}%`, sub: `${summary.visible} of ${summary.total} units surfaced`, accent: "cyan", trend: trendPct(visSpark), spark: visSpark },
      { label: "Avg AI score", value: String(summary.avg), sub: "across the lot", accent: summary.avg >= 70 ? "accent" : "warn", trend: trendPct(avgSpark), spark: avgSpark },
      { label: "AI-sourced leads", value: String(summary.leads), sub: "attributed to inventory", accent: "violet", trend: trendPct(leadSpark), spark: leadSpark },
      { label: "Gross sitting dark", value: money(summary.darkGross), sub: `${summary.darkCount} units invisible to AI`, accent: "warn", invertTrend: true, trend: trendPct(darkSpark), spark: darkSpark },
    ];
  }, [vehicles, summary]);

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
      if (sort === "opp") return oppOf(b) - oppOf(a);
      if (sort === "dol") return b.daysOnLot - a.daysOnLot;
      if (sort === "leads") return b.aiLeads - a.aiLeads;
      return b.price - a.price;
    });
    return sorted;
  }, [vehicles, filter, q, sort]);

  const maxOpp = Math.max(1, ...vehicles.map(oppOf));

  return (
    <div>
      {/* summary KPIs — trend + sparkline parity with the Command Center */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((k) => (
          <StatCard key={k.label} kpi={k} />
        ))}
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
            <option value="opp" className="bg-panel">Sort: Opportunity $</option>
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

      {/* row count */}
      <p className="mt-4 px-1 text-xs text-ink-faint">
        Showing <span className="font-medium text-ink-soft">{rows.length}</span> of{" "}
        {summary.total} units
        {summary.darkCount > 0 && (
          <>
            {" · "}
            <span className="text-danger">{summary.darkCount} invisible to AI</span>
          </>
        )}
      </p>

      {/* mobile cards */}
      <div className="mt-3 space-y-3 lg:hidden">
        {rows.map((v) => (
          <div
            key={v.id}
            onClick={() => setActive(v)}
            className="surface cursor-pointer rounded-2xl p-4 transition-colors hover:bg-black/[0.03]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Thumb v={v} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {v.year} {v.make} {v.model} <span className="text-ink-muted">{v.trim}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {v.stockType} · {v.mileage.toLocaleString()} mi · {v.vin}
                  </p>
                </div>
              </div>
              <ScoreGauge score={v.aiScore} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-sm tabular-nums text-ink-soft">{money(v.price)}</span>
              <span className="text-xs text-ink-faint">
                {v.aiLeads} AI leads
                {oppOf(v) > 0 && (
                  <>
                    {" · "}
                    <span style={{ color: scoreColor(v.aiScore) }}>{money(oppOf(v))} opp</span>
                  </>
                )}
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              {v.blocker === "None" ? (
                <span className="inline-flex items-center gap-1 text-xs text-accent">
                  <Icon name="check" size={13} strokeWidth={2.25} /> Cited in {v.enginesCiting}/5 engines
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
          <table className="w-full min-w-[1080px] border-collapse">
            <thead>
              <tr className="text-xs text-ink-faint">
                <th className="px-4 py-3 text-left font-medium">Vehicle</th>
                <th className="px-3 py-3 text-right font-medium">Price</th>
                <th className="px-3 py-3 text-center font-medium">Days</th>
                <th
                  className="cursor-help px-3 py-3 text-center font-medium"
                  title="0–100: how discoverable this car is in AI answers. Green ≥70 · amber 40–69 · red <40."
                >
                  AI score
                </th>
                <th className="px-3 py-3 text-center font-medium">Engines</th>
                <th className="px-3 py-3 text-center font-medium">AI leads</th>
                <th
                  className="cursor-help px-3 py-3 text-left font-medium"
                  title="Estimated front gross still on the table until this unit is fully AI-visible. Sort by it to work the biggest money first."
                >
                  Opportunity
                </th>
                <th className="px-3 py-3 text-left font-medium">Status</th>
                <th className="px-3 py-3 text-center font-medium">Trend</th>
                <th className="px-3 py-3 text-center font-medium">AI view</th>
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
                    <div className="flex items-center gap-3">
                      <Thumb v={v} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">
                          {v.year} {v.make} {v.model} <span className="text-ink-muted">{v.trim}</span>
                          {inDemand(v) && v.aiScore < 70 && (
                            <span
                              className={cn(
                                "ml-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 align-middle text-[10px] font-semibold",
                                v.aiScore < 40 ? "bg-danger/12 text-danger" : "bg-violet/15 text-violet",
                              )}
                              title={`${v.queriesMatched} buyer queries match this car, but it isn't fully visible yet`}
                            >
                              <Icon name="trending" size={10} strokeWidth={2.5} />
                              {v.aiScore < 40 ? "In demand · invisible" : "In demand"}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-ink-faint">
                          {v.stockType} · {v.mileage.toLocaleString()} mi · {v.vin}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right text-sm tabular-nums text-ink-soft">{money(v.price)}</td>
                  <td className="px-3 py-3 text-center text-sm tabular-nums">
                    <span className={v.daysOnLot >= 45 ? "text-warn" : "text-ink-muted"}>{v.daysOnLot}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center">
                      <ScoreGauge score={v.aiScore} />
                    </div>
                  </td>
                  <td className="px-3 py-3"><div className="flex justify-center"><EngineDots v={v} /></div></td>
                  <td className="px-3 py-3 text-center text-sm tabular-nums text-ink-soft">{v.aiLeads}</td>
                  <td className="px-3 py-3">
                    {oppOf(v) <= 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-accent">
                        <Icon name="check" size={12} strokeWidth={2.5} /> Captured
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-black/[0.06]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.min(100, (oppOf(v) / maxOpp) * 100)}%`, background: scoreColor(v.aiScore) }}
                          />
                        </div>
                        <span className="text-sm tabular-nums text-ink-soft">{money(oppOf(v))}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {v.blocker === "None" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-accent"><Icon name="check" size={13} strokeWidth={2.25} /> Cited in {v.enginesCiting}/5 engines</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-warn"><Icon name="bolt" size={12} strokeWidth={2.25} /> {v.blocker}</span>
                    )}
                  </td>
                  <td className="px-3 py-3"><div className="flex justify-center"><Sparkline data={v.trend} accent={scoreTone(v.aiScore)} width={72} height={26} /></div></td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setActive(v); }}
                        title="Watch the live AI answer for this car"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-muted transition-colors hover:border-cyan/50 hover:bg-cyan/10 hover:text-cyan"
                      >
                        <Icon name="sparkles" size={15} />
                      </button>
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
          dealer={dealer}
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

const ENGINE_SHORT: Record<string, string> = {
  ChatGPT: "ChatGPT",
  Perplexity: "Perplexity",
  Gemini: "Gemini",
  "Google AI Overviews": "Google AIO",
  "Bing Copilot": "Copilot",
};

/** Reveal text character-by-character — the "live AI answer" streaming effect. */
function useTypewriter(text: string, speed = 12) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setOut("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      if (i >= text.length) {
        setOut(text);
        setDone(true);
        clearInterval(id);
      } else {
        setOut(text.slice(0, i));
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { out, done };
}

/**
 * The "wow": a live AI-answer simulator. Streams a believable engine answer for a
 * real buyer query about this car — and shows whether YOUR store is cited or a
 * competitor wins, per engine. Uses the vehicle's existing citation data.
 */
function AiAnswerSimulator({ vehicle: v, dealer }: { vehicle: Vehicle; dealer: Dealer }) {
  const cityShort = dealer.metro.split(",")[0] || "your area";
  const cites = v.citations.length
    ? v.citations
    : [
        {
          query: `best ${v.make} ${v.model} near ${cityShort}`,
          topSource: v.enginesCiting > 0 ? "Your VDP" : "Carvana",
          engines: v.engines,
        },
      ];
  const [qi, setQi] = useState(0);
  const citation = cites[Math.min(qi, cites.length - 1)];
  const [engine, setEngine] = useState<EngineName>(
    ENGINES.find((e) => citation.engines[e]) ?? ENGINES[0],
  );
  useEffect(() => {
    setEngine(ENGINES.find((e) => cites[qi]?.engines[e]) ?? ENGINES[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi]);

  const cited = !!citation.engines[engine];
  const car = `${v.year} ${v.make} ${v.model} ${v.trim}`.trim();
  const dealerSite = dealer.name.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".com";
  const competitor =
    citation.topSource && citation.topSource !== "Your VDP" ? citation.topSource : "Carvana";

  const answer = cited
    ? `A strong match near ${cityShort} is the ${car} at ${dealer.name} — ${money(
        v.price,
      )}, ${v.mileage.toLocaleString()} miles. It's in stock now and fits "${citation.query}." Worth a look before it sells.`
    : `For "${citation.query}," a frequently cited option is a comparable ${v.year} ${v.make} ${v.model} on ${competitor}. I don't see ${dealer.name}'s matching unit surfaced for this question yet.`;

  const { out, done } = useTypewriter(answer);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-canvas-2/50">
      {/* engine tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-black/[0.02] px-3 py-2">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-cyan/12 text-cyan">
          <Icon name="sparkles" size={14} />
        </span>
        <div className="flex flex-1 flex-wrap gap-1">
          {ENGINES.map((e) => {
            const on = e === engine;
            const eCited = !!citation.engines[e];
            return (
              <button
                key={e}
                onClick={() => setEngine(e)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                  on ? "bg-ink text-canvas" : "text-ink-muted hover:bg-black/[0.05] hover:text-ink",
                )}
                title={`${e}: ${eCited ? "your car is cited" : "competitor cited"}`}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    eCited ? "bg-accent" : "bg-danger/60",
                  )}
                />
                {ENGINE_SHORT[e] ?? e}
              </button>
            );
          })}
        </div>
        <span className="flex items-center gap-1 text-[10px] font-medium text-ink-faint">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" /> Live answer
        </span>
      </div>

      {/* conversation */}
      <div className="space-y-3 p-4">
        {cites.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {cites.map((c, i) => (
              <button
                key={i}
                onClick={() => setQi(i)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                  i === qi
                    ? "border-cyan/40 bg-cyan/10 text-cyan"
                    : "border-line bg-black/[0.02] text-ink-muted hover:text-ink",
                )}
              >
                {c.query.length > 34 ? c.query.slice(0, 32) + "…" : c.query}
              </button>
            ))}
          </div>
        )}

        {/* buyer question */}
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-cyan px-3.5 py-2 text-sm text-ink-inverse">
            {citation.query}
          </div>
        </div>

        {/* streaming AI answer */}
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink text-xs font-semibold text-canvas">
            {(ENGINE_SHORT[engine] ?? "AI")[0]}
          </span>
          <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-line bg-white px-3.5 py-2.5 text-sm leading-relaxed text-ink-soft">
            {out}
            {!done && (
              <span className="ml-0.5 inline-block h-3.5 w-[3px] animate-pulse bg-cyan align-middle" />
            )}
            {done && (
              <div
                className={cn(
                  "mt-2.5 flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs",
                  cited
                    ? "border-accent/30 bg-accent/[0.06] text-accent"
                    : "border-danger/30 bg-danger/[0.06] text-danger",
                )}
              >
                <Icon name={cited ? "check" : "close"} size={13} strokeWidth={2.5} />
                {cited ? (
                  <span className="truncate">
                    Source: <span className="font-medium">{dealerSite}/inventory/{v.vin.slice(-6).toLowerCase()}</span>
                  </span>
                ) : (
                  <span>
                    AI recommended <span className="font-medium">{competitor}</span> — not you
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* verdict footer */}
      <div
        className={cn(
          "flex items-center gap-2 border-t px-4 py-2.5 text-xs font-medium",
          cited
            ? "border-accent/20 bg-accent/[0.05] text-accent"
            : "border-danger/20 bg-danger/[0.05] text-danger",
        )}
      >
        <Icon name={cited ? "check" : "radar"} size={14} strokeWidth={2.5} />
        {cited
          ? `Your car is the answer buyers see in ${ENGINE_SHORT[engine]}.`
          : `${ENGINE_SHORT[engine]} sends this buyer elsewhere — LotPilot is closing this gap.`}
      </div>
    </div>
  );
}

function VehicleDetail({
  vehicle: v,
  dealer,
  onClose,
  onViewPage,
}: {
  vehicle: Vehicle;
  dealer: Dealer;
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
          <p className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider text-ink-faint">
            <Icon name="sparkles" size={13} className="text-cyan" />
            Live AI answer · what buyers actually get
          </p>
          <AiAnswerSimulator vehicle={v} dealer={dealer} />
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
