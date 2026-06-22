import Shell from "@/components/dashboard/Shell";
import { Card, PanelHeading, Badge } from "@/components/dashboard/ui";
import { Sparkline } from "@/components/dashboard/charts";
import { requireDealer, getDemand } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { tone: "danger" | "accent" | "warn"; label: string }> = {
  gap: { tone: "danger", label: "Demand gap" },
  covered: { tone: "accent", label: "Covered" },
  surplus: { tone: "warn", label: "Surplus" },
};

export default async function DemandPage() {
  const { dealer, profile } = await requireDealer();
  const demand = await getDemand();

  const gaps = demand.filter((d) => d.status === "gap");
  const totalGapVolume = gaps.reduce((s, d) => s + d.weeklyVolume, 0);

  return (
    <Shell
      dealer={dealer}
      profile={profile}
      title="Demand Intelligence"
      intro="What buyers are asking AI in your market — and where your inventory answers (or doesn't)."
    >
      {/* headline */}
      <Card glow className="relative overflow-hidden">
        <div className="glow-violet pointer-events-none absolute -right-10 -top-16 h-56 w-56 opacity-50" />
        <div className="relative">
          <Badge tone="violet">● Market signal</Badge>
          <h2 className="mt-3 text-pretty text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            <span className="text-gradient">{totalGapVolume.toLocaleString()} buyers/week</span> are
            asking AI for cars you could be selling — and a competitor is getting the answer.
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            {gaps.length} demand clusters where you&apos;re under-cited. Close them and the leads
            route to you.
          </p>
        </div>
      </Card>

      <Card className="mt-6 p-0">
        <div className="p-5 sm:p-6">
          <PanelHeading
            title="Buyer demand vs your coverage"
            sub="Weekly query volume in Austin, TX"
          />
        </div>
        <div className="overflow-x-auto scroll-slim">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="text-xs text-ink-faint">
                <th className="px-5 py-3 text-left font-medium">What buyers ask AI</th>
                <th className="px-3 py-3 text-center font-medium">Weekly</th>
                <th className="px-3 py-3 text-center font-medium">Trend</th>
                <th className="px-3 py-3 text-center font-medium">Your stock</th>
                <th className="px-3 py-3 text-center font-medium">You cited</th>
                <th className="px-3 py-3 text-left font-medium">AI favors</th>
                <th className="px-3 py-3 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {demand.map((d) => {
                const meta = STATUS[d.status];
                return (
                  <tr key={d.query} className="border-t border-line">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-ink">{d.query}</p>
                      <p className="text-xs text-ink-faint">{d.segment}</p>
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-semibold tabular-nums text-ink">
                      {d.weeklyVolume}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <Sparkline data={d.trend} accent="violet" width={64} height={24} />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-sm tabular-nums text-ink-soft">{d.yourStock}</td>
                    <td className="px-3 py-3 text-center text-sm tabular-nums">
                      <span className={d.cited < d.yourStock ? "text-warn" : "text-accent"}>
                        {d.cited}/{d.yourStock}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <span className={d.topSource === "You" ? "text-accent" : "text-danger"}>
                        {d.topSource}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="px-5 pb-5 pt-3 text-xs text-ink-faint">
          Gaps = high demand where you&apos;re under-cited. These are the fastest wins.
        </p>
      </Card>
    </Shell>
  );
}
