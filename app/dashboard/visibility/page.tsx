import Link from "next/link";
import Shell from "@/components/dashboard/Shell";
import { Card, PanelHeading, Badge } from "@/components/dashboard/ui";
import { LineChart, Donut, ProgressBar } from "@/components/dashboard/charts";
import Benchmarks from "@/components/dashboard/Benchmarks";
import AnswerMonitor from "@/components/dashboard/AnswerMonitor";
import RunScanButton from "@/components/dashboard/RunScanButton";
import {
  requireDealer,
  getVisibility,
  getPillars,
  getVisibilityMonitor,
  getShareOfVoice,
  getRecommendedVins,
  getBenchmarks,
  getVehicles,
} from "@/lib/dashboard/queries";
import { ENGINES } from "@/lib/dashboard/types";

export const dynamic = "force-dynamic";

// Turn the score band into a plain verdict a dealer reads instantly.
const BAND_VERDICT: Record<
  string,
  { label: string; tone: "danger" | "warn" | "cyan" | "accent" }
> = {
  critical: { label: "Critical — AI rarely surfaces you", tone: "danger" },
  weak: { label: "Weak — surfaced inconsistently", tone: "warn" },
  developing: { label: "Developing — gaining ground", tone: "cyan" },
  strong: { label: "Strong — top-tier AI visibility", tone: "accent" },
};

// Plain-English translation of each technical pillar — so it makes sense to a dealer.
const PILLAR_HELP: Record<string, string> = {
  Crawlability: "Can AI bots actually read your vehicle pages?",
  "Structured-data fidelity":
    "Are your listings tagged so AI gets price, trim & specs right?",
  Freshness: "Do sold units drop and price changes reach AI fast?",
  "Citation presence": "How often AI quotes your store as the source.",
  "Entity consistency":
    "Does your name, address & phone match everywhere AI looks?",
};

export default async function VisibilityPage() {
  const { dealer, profile } = await requireDealer();
  const [visibility, pillars, monitor, sov, vins, benchmarks, vehicles] = await Promise.all([
    getVisibility(),
    getPillars(),
    getVisibilityMonitor(dealer.id),
    getShareOfVoice(),
    getRecommendedVins(),
    getBenchmarks(),
    getVehicles(),
  ]);
  const queries = monitor.queries;

  const you = sov.find((s) => s.value === Math.max(...sov.map((x) => x.value)));

  const monthlyDemand = queries.reduce((sum, q) => sum + (q.volume ?? 0), 0);
  const gapDemand = queries
    .filter((q) => q.competitor)
    .reduce((sum, q) => sum + (q.volume ?? 0), 0);

  const totalQueries = queries.length;
  const citedQueries = queries.filter((q) => !q.competitor).length;
  const verdict = visibility ? BAND_VERDICT[visibility.band] : null;

  // THE hero metric (product doc §4.3): % of live inventory that is the cited
  // answer — VIN-grounded, not store-level reputation. A VIN counts as cited
  // when at least one AI engine surfaces it (same signal Inventory AI uses).
  const totalVins = vehicles.length;
  const citedVins = vehicles.filter((v) => v.enginesCiting > 0).length;
  const darkVins = totalVins - citedVins;
  const citationRate = totalVins ? Math.round((citedVins / totalVins) * 100) : 0;

  // First-run: brand-new dealer, no scan yet (spec §6.3).
  if (!visibility && queries.length === 0) {
    return (
      <Shell
        dealer={dealer}
        profile={profile}
        title="AI Visibility"
        intro="How discoverable your inventory is across AI answer engines."
      >
        <Card glow className="relative overflow-hidden text-center">
          <div className="glow-cyan pointer-events-none absolute left-1/2 -top-16 h-56 w-56 -translate-x-1/2 opacity-50" />
          <div className="relative mx-auto max-w-xl py-6">
            <Badge tone="cyan">● Not yet measured</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              See where you stand in <span className="text-gradient">AI search.</span>
            </h2>
            <p className="mt-3 text-sm text-ink-muted">
              We&apos;ll ask ChatGPT, Grok, Perplexity, Gemini and Claude the car-buying questions
              your local buyers actually type — then show you exactly where {dealer.name} appears,
              and which competitors show up instead.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <RunScanButton label="Run your first scan" />
              <Link
                href="/#feed"
                className="inline-flex h-10 items-center rounded-full border border-line-strong px-5 text-sm font-medium text-ink transition-colors hover:border-cyan/50 hover:bg-black/[0.04]"
              >
                Connect your feed
              </Link>
            </div>
            <p className="mt-5 text-xs text-ink-faint">
              Takes about a minute · runs across all 5 AI answer engines.
            </p>
          </div>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell
      dealer={dealer}
      profile={profile}
      title="AI Visibility"
      intro="How discoverable your inventory is across AI answer engines."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Card glow className="flex flex-col items-center justify-center text-center">
          <p className="text-sm text-ink-muted">Inventory Citation Rate</p>
          <div className="mt-3 text-7xl font-bold leading-none tracking-tight text-ink">
            {citationRate}
            <span className="align-top text-2xl font-semibold text-ink-faint">%</span>
          </div>
          <p className="mt-2 max-w-[18rem] text-sm font-medium leading-snug text-ink-soft">
            of your live inventory is the cited answer in AI
          </p>
          {verdict && (
            <Badge tone={verdict.tone} className="mt-3">
              {verdict.label}
            </Badge>
          )}
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">
              {citedVins} of {totalVins} VINs
            </span>{" "}
            cited across AI engines{darkVins > 0 && <> · {darkVins} still dark</>}.
            <br />
            <span className="text-xs text-ink-muted">Refreshes as your feed changes.</span>
          </p>
          {you && (
            <p className="mt-1.5 text-xs text-ink-muted">
              <span className="font-semibold text-ink">#1 store</span> in {dealer.metro} ·{" "}
              {you.value}% share of voice · cited in {citedQueries}/{totalQueries} tracked queries
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge tone="cyan">AVTS {visibility?.score ?? "—"}/100</Badge>
            {visibility && (
              <Badge tone="accent">▲ +{visibility.delta} since feed connect</Badge>
            )}
          </div>
          <div className="mt-5">
            <RunScanButton />
          </div>
        </Card>

        <Card>
          <PanelHeading
            title="Score over time"
            sub="Last 12 weeks"
            action={
              <Link href="/dashboard/visibility/history" className="text-xs text-cyan hover:underline">
                Full history →
              </Link>
            }
          />
          <LineChart data={visibility?.trend ?? []} accent="accent" height={170} />
          <div className="mt-2 flex justify-between text-xs text-ink-faint">
            <span>12 wks ago</span>
            <span>Today</span>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <PanelHeading
          title="Visibility by engine"
          sub="How often you're the cited answer on each AI platform"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ENGINES.map((e) => {
            const cited = queries.filter((q) => q.engines[e]).length;
            const pct = totalQueries ? Math.round((cited / totalQueries) * 100) : 0;
            const color =
              pct >= 50
                ? "var(--color-accent)"
                : pct >= 20
                  ? "var(--color-cyan)"
                  : "var(--color-danger)";
            const label = e.replace(" AI Overviews", " AIO").replace("Bing ", "");
            return (
              <div key={e} className="rounded-xl border border-line bg-black/[0.02] p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{label}</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color }}>
                    {pct}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/[0.06]">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
                <p className="mt-2 text-xs text-ink-faint">
                  cited in {cited} of {totalQueries} queries
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Newer engines like Grok and Claude are where most dealers are invisible — LotPilot
          prioritizes closing those gaps first.
        </p>
      </Card>

      <Card className="mt-6">
        <PanelHeading title="The five pillars" sub="What the score is built from" />
        <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.label}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm text-ink-soft">{p.label}</span>
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums text-ink">{p.score}</span>
                  <span className="text-xs text-accent">▲{p.delta}</span>
                </span>
              </div>
              <ProgressBar
                value={p.score}
                label={`${p.label}: ${p.score} out of 100`}
                accent={p.score >= 75 ? "accent" : p.score >= 55 ? "cyan" : "warn"}
              />
              {PILLAR_HELP[p.label] && (
                <p className="mt-1.5 text-xs leading-snug text-ink-faint">
                  {PILLAR_HELP[p.label]}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {queries.length > 0 && (
        <div className="mt-6">
          <AnswerMonitor
            dealerName={dealer.name}
            metro={dealer.metro}
            queries={queries}
            captures={monitor.captures}
            live={monitor.live}
          />
        </div>
      )}

      <Card className="mt-6">
        <PanelHeading title="Where you show up" sub="Real buyer queries in your market, by engine" />

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-black/[0.02] p-3.5">
            <p className="text-xs text-ink-faint">Monthly buyer demand</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
              {monthlyDemand.toLocaleString()}
            </p>
            <p className="text-xs text-ink-muted">searches across these queries</p>
          </div>
          <div className="rounded-xl border border-danger/25 bg-danger/[0.06] p-3.5">
            <p className="text-xs text-ink-faint">Gross at risk</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-danger">
              {visibility?.grossAtRisk ?? "—"}
            </p>
            <p className="text-xs text-ink-muted">
              {gapDemand.toLocaleString()} searches AI sends elsewhere
            </p>
          </div>
          <div className="rounded-xl border border-accent/25 bg-accent/[0.06] p-3.5">
            <p className="text-xs text-ink-faint">Projected upside</p>
            <p className="mt-1 text-base font-semibold leading-snug text-accent">
              {visibility?.projectedLeads ?? "—"}
            </p>
            <p className="text-xs text-ink-muted">as LotPilot closes these gaps</p>
          </div>
        </div>

        {/* mobile cards */}
        <div className="space-y-3 sm:hidden">
          {queries.map((q) => (
            <div key={q.query} className="rounded-xl border border-line bg-black/[0.02] p-3">
              <p className="text-sm font-medium text-ink">{q.query}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {q.volume.toLocaleString()} searches/mo
                {q.competitor && (
                  <>
                    {" · "}
                    <span className="text-danger">AI names {q.competitor}</span>
                  </>
                )}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {ENGINES.map((e) => (
                  <span
                    key={e}
                    className={
                      q.engines[e]
                        ? "inline-flex items-center gap-1 rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] text-accent"
                        : "inline-flex items-center gap-1 rounded-md border border-line bg-black/[0.02] px-2 py-0.5 text-[11px] text-ink-faint"
                    }
                  >
                    {q.engines[e] ? "✓" : "✕"}{" "}
                    {e.replace(" AI Overviews", " AIO").replace("Bing ", "")}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="-mx-2 hidden overflow-x-auto scroll-slim sm:block">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="text-xs text-ink-faint">
                <th className="px-2 pb-3 text-left font-medium">Buyer query</th>
                <th className="px-2 pb-3 text-right font-medium">Searches/mo</th>
                {ENGINES.map((e) => (
                  <th key={e} className="px-2 pb-3 text-center font-medium">
                    {e.replace(" AI Overviews", " AIO").replace("Bing ", "")}
                  </th>
                ))}
                <th className="px-2 pb-3 text-left font-medium">AI recommends</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((q) => (
                <tr key={q.query} className="border-t border-line">
                  <td className="px-2 py-3 text-sm text-ink-soft">{q.query}</td>
                  <td className="px-2 py-3 text-right text-sm tabular-nums text-ink-muted">
                    {q.volume.toLocaleString()}
                  </td>
                  {ENGINES.map((e) => (
                    <td key={e} className="px-2 py-3 text-center">
                      {q.engines[e] ? (
                        <span
                          className="inline-grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-xs text-accent"
                          title={`Cited in ${e}`}
                        >
                          <span aria-hidden="true">✓</span>
                          <span className="sr-only">Cited in {e}</span>
                        </span>
                      ) : (
                        <span
                          className="inline-grid h-6 w-6 place-items-center rounded-full bg-danger/10 text-xs text-danger"
                          title={`Not cited in ${e}`}
                        >
                          <span aria-hidden="true">✕</span>
                          <span className="sr-only">Not cited in {e}</span>
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-2 py-3 text-sm">
                    {q.competitor ? (
                      <span className="text-danger">{q.competitor}</span>
                    ) : (
                      <span className="text-accent">You</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          ✓ = your inventory cited · ✕ = gap LotPilot is already working to close. Nothing for your
          team to do.
        </p>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <PanelHeading
            title="Share of voice"
            sub="Who AI recommends in your market"
            action={
              <Link
                href="/dashboard/visibility/competitors"
                className="text-xs text-cyan hover:underline"
              >
                Track competitors →
              </Link>
            }
          />
          <div className="flex flex-col flex-wrap items-center justify-center gap-8 sm:flex-row">
            <Donut segments={sov} centerLabel={you ? `${you.value}%` : ""} centerSub="you" />
            <ul className="space-y-2">
              {sov.map((s) => (
                <li key={s.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-ink-soft">{s.name}</span>
                  <span className="ml-auto tabular-nums text-ink-muted">{s.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card>
          <PanelHeading title="Vehicles AI recommended" sub="Units driving AI-sourced leads" />
          <ul className="space-y-2.5">
            {vins.map((v) => (
              <li
                key={v.vehicle}
                className="flex items-center gap-3 rounded-xl border border-line bg-black/[0.02] p-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/12 text-accent">
                  ★
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{v.vehicle}</p>
                  <p className="text-xs text-ink-muted">
                    {v.price} · cited by {v.engine}
                  </p>
                </div>
                <Badge tone="cyan">{v.leads} leads</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <PanelHeading
          title="How you stack up"
          sub="Benchmarked against comparable franchise dealers"
        />
        <Benchmarks items={benchmarks} />
      </Card>
    </Shell>
  );
}
