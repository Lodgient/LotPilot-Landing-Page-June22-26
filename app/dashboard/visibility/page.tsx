import Shell from "@/components/dashboard/Shell";
import { Card, PanelHeading, Badge } from "@/components/dashboard/ui";
import { LineChart, Donut, ProgressBar } from "@/components/dashboard/charts";
import {
  requireDealer,
  getVisibility,
  getPillars,
  getVisibilityQueries,
  getShareOfVoice,
  getRecommendedVins,
} from "@/lib/dashboard/queries";
import { ENGINES } from "@/lib/dashboard/types";

export const dynamic = "force-dynamic";

export default async function VisibilityPage() {
  const { dealer, profile } = await requireDealer();
  const [visibility, pillars, queries, sov, vins] = await Promise.all([
    getVisibility(),
    getPillars(),
    getVisibilityQueries(),
    getShareOfVoice(),
    getRecommendedVins(),
  ]);

  const you = sov.find((s) => s.value === Math.max(...sov.map((x) => x.value)));

  return (
    <Shell
      dealer={dealer}
      profile={profile}
      title="AI Visibility"
      intro="How discoverable your inventory is across AI answer engines."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Card glow className="flex flex-col items-center justify-center text-center">
          <p className="text-sm text-ink-muted">AI Visibility Score</p>
          <div className="mt-3 text-7xl font-bold tracking-tight text-ink">
            {visibility?.score ?? "—"}
          </div>
          <p className="mt-1 text-xs text-ink-faint">out of 100</p>
          {visibility && (
            <Badge tone="accent" className="mt-4">
              ▲ +{visibility.delta} pts since feed connect
            </Badge>
          )}
        </Card>

        <Card>
          <PanelHeading title="Score over time" sub="Last 12 weeks" />
          <LineChart data={visibility?.trend ?? []} accent="accent" height={170} />
          <div className="mt-2 flex justify-between text-xs text-ink-faint">
            <span>12 wks ago</span>
            <span>Today</span>
          </div>
        </Card>
      </div>

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
                accent={p.score >= 75 ? "accent" : p.score >= 55 ? "cyan" : "warn"}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-6">
        <PanelHeading title="Where you show up" sub="Real buyer queries in your market, by engine" />
        <div className="-mx-2 overflow-x-auto scroll-slim">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="text-xs text-ink-faint">
                <th className="px-2 pb-3 text-left font-medium">Buyer query</th>
                {ENGINES.map((e) => (
                  <th key={e} className="px-2 pb-3 text-center font-medium">
                    {e.replace(" AI Overviews", " AIO").replace("Bing ", "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queries.map((q) => (
                <tr key={q.query} className="border-t border-line">
                  <td className="px-2 py-3 text-sm text-ink-soft">{q.query}</td>
                  {ENGINES.map((e) => (
                    <td key={e} className="px-2 py-3 text-center">
                      {q.engines[e] ? (
                        <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-xs text-accent">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-danger/10 text-xs text-danger">
                          ✕
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          ✓ = your inventory cited · ✕ = gap to close. Citation presence is where we focus next.
        </p>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <PanelHeading title="Share of voice" sub="Who AI recommends in your market" />
          <div className="flex flex-wrap items-center justify-center gap-8">
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
                className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-3"
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
    </Shell>
  );
}
