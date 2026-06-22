import Shell from "@/components/dashboard/Shell";
import { Card, PanelHeading, StatCard, Badge } from "@/components/dashboard/ui";
import { Funnel } from "@/components/dashboard/charts";
import {
  requireDealer,
  getKpis,
  getFunnel,
  getVsMarketplace,
  getCustomersOwned,
  getAttributionByEngine,
} from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

const money = (n: number) => "$" + n.toLocaleString();

export default async function RoiPage() {
  const { dealer, profile } = await requireDealer();
  const [kpis, funnel, vsMarket, owned, byEngine] = await Promise.all([
    getKpis("roi"),
    getFunnel(),
    getVsMarketplace(),
    getCustomersOwned(),
    getAttributionByEngine(),
  ]);
  const maxGross = Math.max(...byEngine.map((e) => e.gross), 1);
  const totalGross = byEngine.reduce((s, e) => s + e.gross, 0);

  return (
    <Shell
      dealer={dealer}
      profile={profile}
      title="ROI & Attribution"
      intro="What the AI channel is worth — and who owns the customer."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <StatCard key={k.label} kpi={k} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <PanelHeading title="AI revenue funnel" sub="This month, lead → sale" />
          <Funnel stages={funnel} />
        </Card>

        <Card glow className="relative flex flex-col justify-center overflow-hidden text-center">
          <div className="glow-accent pointer-events-none absolute -left-10 -top-10 h-48 w-48 opacity-50" />
          <div className="relative">
            <p className="text-sm text-ink-muted">Customers you own outright</p>
            <div className="mt-2 text-6xl font-bold tracking-tight text-gradient">{owned}</div>
            <p className="mt-2 text-sm text-ink-soft">
              Every AI-sourced lead this month is yours alone.
            </p>
            <Badge tone="accent" className="mt-4">
              0 resold to competitors
            </Badge>
          </div>
        </Card>
      </div>

      {/* Attribution by engine */}
      <Card className="mt-6">
        <PanelHeading
          title="Attribution by AI engine"
          sub={`${money(totalGross)} in front gross traced to AI this month`}
        />
        <div className="overflow-x-auto scroll-slim">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="text-xs text-ink-faint">
                <th className="px-3 py-3 text-left font-medium">Engine</th>
                <th className="px-3 py-3 text-center font-medium">Leads</th>
                <th className="px-3 py-3 text-center font-medium">Appts</th>
                <th className="px-3 py-3 text-center font-medium">Sales</th>
                <th className="px-3 py-3 text-left font-medium">Attributed gross</th>
              </tr>
            </thead>
            <tbody>
              {byEngine.map((e) => (
                <tr key={e.engine} className="border-t border-line">
                  <td className="px-3 py-3 text-sm font-medium text-ink">{e.engine}</td>
                  <td className="px-3 py-3 text-center text-sm tabular-nums text-ink-soft">{e.leads}</td>
                  <td className="px-3 py-3 text-center text-sm tabular-nums text-ink-soft">{e.appts}</td>
                  <td className="px-3 py-3 text-center text-sm tabular-nums text-ink-soft">{e.sales}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan to-violet"
                          style={{ width: `${(e.gross / maxGross) * 100}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-sm tabular-nums text-ink-soft">
                        {money(e.gross)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <PanelHeading title="LotPilot vs marketplaces" sub="The same spend, a very different deal" />
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-white/[0.02] text-xs text-ink-faint">
            <div className="p-3 sm:p-4">&nbsp;</div>
            <div className="border-l border-line p-3 text-center font-semibold text-gradient sm:p-4">
              LotPilot
            </div>
            <div className="border-l border-line p-3 text-center sm:p-4">Marketplaces</div>
          </div>
          {vsMarket.map((r, i) => (
            <div
              key={r.metric}
              className={`grid grid-cols-[1.4fr_1fr_1fr] text-sm ${i % 2 ? "bg-white/[0.012]" : ""}`}
            >
              <div className="flex items-center p-3 text-ink-soft sm:p-4">{r.metric}</div>
              <div className="flex items-center justify-center gap-1.5 border-l border-line p-3 text-center sm:p-4">
                <span className="text-accent">✓</span>
                <span className="text-ink">{r.lp}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 border-l border-line p-3 text-center text-ink-muted sm:p-4">
                <span className="text-danger">✕</span>
                <span>{r.mk}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan/25 bg-cyan/[0.05] p-4">
          <p className="text-sm text-ink-soft">
            Board-ready monthly attribution report, exported in one click.
          </p>
          <button className="inline-flex h-10 items-center rounded-full bg-cyan px-5 text-sm font-semibold text-ink-inverse transition-colors hover:bg-cyan/90">
            Export report
          </button>
        </div>
      </Card>
    </Shell>
  );
}
