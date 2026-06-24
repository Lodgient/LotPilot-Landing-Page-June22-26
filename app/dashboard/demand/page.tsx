import Shell from "@/components/dashboard/Shell";
import Icon, { type IconName } from "@/components/Icon";
import { Card, PanelHeading, Badge } from "@/components/dashboard/ui";
import { Sparkline } from "@/components/dashboard/charts";
import { ExportCsv } from "@/components/dashboard/Exports";
import { requireDealer, getDemand } from "@/lib/dashboard/queries";
import { cn } from "@/lib/cn";

function Tile({
  icon,
  tone,
  value,
  label,
  sub,
}: {
  icon: IconName;
  tone: "violet" | "danger" | "accent" | "warn";
  value: string;
  label: string;
  sub?: string;
}) {
  const chip: Record<string, string> = {
    violet: "bg-violet/15 text-violet ring-violet/20",
    danger: "bg-danger/12 text-danger ring-danger/20",
    accent: "bg-accent/12 text-accent ring-accent/20",
    warn: "bg-warn/12 text-warn ring-warn/20",
  };
  return (
    <Card className="flex flex-col gap-3">
      <span className={cn("grid h-8 w-8 place-items-center rounded-lg ring-1 ring-inset", chip[tone])}>
        <Icon name={icon} size={16} />
      </span>
      <div>
        <div className="text-2xl font-bold tracking-tight text-ink">{value}</div>
        <div className="mt-0.5 text-xs text-ink-muted">{label}</div>
        {sub && <div className="mt-0.5 text-[11px] text-ink-faint">{sub}</div>}
      </div>
    </Card>
  );
}

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
  const totalVolume = demand.reduce((s, d) => s + d.weeklyVolume, 0);
  const covered = demand.filter((d) => d.status === "covered").length;
  const surplus = demand.filter((d) => d.status === "surplus").length;
  const coveragePct = demand.length ? Math.round((covered / demand.length) * 100) : 0;
  // surface the actionable rows (demand gaps) first, biggest volume on top
  const rank: Record<string, number> = { gap: 0, surplus: 1, covered: 2 };
  const ordered = [...demand].sort(
    (a, b) => rank[a.status] - rank[b.status] || b.weeklyVolume - a.weeklyVolume,
  );

  return (
    <Shell
      dealer={dealer}
      profile={profile}
      title="Demand Intelligence"
      intro="What buyers are asking AI in your market — and where your inventory answers (or doesn't)."
    >
      {demand.length === 0 ? (
        <Card glow className="relative overflow-hidden text-center">
          <div className="glow-violet pointer-events-none absolute left-1/2 -top-16 h-56 w-56 -translate-x-1/2 opacity-50" />
          <div className="relative mx-auto max-w-xl py-6">
            <Badge tone="violet">● No signal yet</Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              See what buyers are asking AI{dealer.metro ? (
                <>
                  {" "}in <span className="text-gradient">{dealer.metro}.</span>
                </>
              ) : (
                <span className="text-gradient"> in your market.</span>
              )}
            </h2>
            <p className="mt-3 text-sm text-ink-muted">
              Once your feed is live, we map the car-buying questions buyers ask AI in your market
              against your inventory — and surface the demand gaps competitors are winning, so you
              know what to stock and where you&apos;re invisible.
            </p>
            <div className="mt-6">
              <a
                href="/#feed"
                className="inline-flex h-11 items-center rounded-full bg-cyan px-6 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan/90 cta-glow"
              >
                Connect your feed →
              </a>
            </div>
          </div>
        </Card>
      ) : (
      <>
      {/* headline */}
      <Card glow className="relative overflow-hidden">
        <div className="glow-violet pointer-events-none absolute -right-10 -top-16 h-56 w-56 opacity-50" />
        <div className="relative">
          <Badge tone="violet">● Market signal</Badge>
          <h2 className="mt-3 text-pretty text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            <span className="text-gradient">{totalGapVolume.toLocaleString()} buyers/week</span> are
            asking AI for cars you could be selling — LotPilot is winning back the answer.
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            {gaps.length} demand clusters where you&apos;re under-cited. LotPilot is closing them so
            the leads route to you — automatically.
          </p>
        </div>
      </Card>

      {/* signal KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          icon="search"
          tone="violet"
          value={totalVolume.toLocaleString()}
          label="Buyers/week asking AI"
          sub={`across ${demand.length} demand clusters`}
        />
        <Tile
          icon="radar"
          tone="danger"
          value={String(gaps.length)}
          label="Demand gaps"
          sub={`${totalGapVolume.toLocaleString()} buyers/wk you're missing`}
        />
        <Tile
          icon="check"
          tone="accent"
          value={`${coveragePct}%`}
          label="Demand covered"
          sub={`${covered} of ${demand.length} clusters`}
        />
        <Tile
          icon="trending"
          tone="warn"
          value={String(surplus)}
          label="Surplus segments"
          sub="overstocked vs demand"
        />
      </div>

      <Card className="mt-6 p-0">
        <div className="p-5 sm:p-6">
          <PanelHeading
            title="Buyer demand vs your coverage"
            sub={`Weekly query volume in ${dealer.metro}`}
            action={
              <ExportCsv
                filename="lotpilot-demand.csv"
                columns={[
                  { key: "query", label: "Query" },
                  { key: "segment", label: "Segment" },
                  { key: "weeklyVolume", label: "Weekly volume" },
                  { key: "yourStock", label: "Your stock" },
                  { key: "cited", label: "Cited" },
                  { key: "topSource", label: "AI favors" },
                  { key: "status", label: "Status" },
                ]}
                rows={ordered.map((d) => ({
                  query: d.query,
                  segment: d.segment,
                  weeklyVolume: d.weeklyVolume,
                  yourStock: d.yourStock,
                  cited: d.cited,
                  topSource: d.topSource,
                  status: d.status,
                }))}
              />
            }
          />
        </div>
        {/* mobile cards */}
        <div className="space-y-3 px-5 pb-1 lg:hidden">
          {ordered.map((d) => {
            const meta = STATUS[d.status];
            return (
              <div key={d.query} className="rounded-xl border border-line bg-black/[0.02] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{d.query}</p>
                    <p className="text-xs text-ink-faint">{d.segment}</p>
                  </div>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Weekly</span>
                    <span className="font-semibold tabular-nums text-ink">{d.weeklyVolume}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Your stock</span>
                    <span className="tabular-nums text-ink-soft">{d.yourStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Cited</span>
                    <span className={cn("tabular-nums", d.cited < d.yourStock ? "text-warn" : "text-accent")}>
                      {d.cited}/{d.yourStock}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">AI favors</span>
                    <span className={d.topSource === "You" ? "text-accent" : "text-danger"}>
                      {d.topSource}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden overflow-x-auto scroll-slim lg:block">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-line bg-canvas-2/50 text-[11px] uppercase tracking-[0.07em] text-ink-faint">
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
              {ordered.map((d, i) => {
                const meta = STATUS[d.status];
                return (
                  <tr
                    key={d.query}
                    className={cn("border-t border-line", i % 2 === 1 && "bg-black/[0.015]")}
                  >
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
                      {d.topSource === "You" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-xs font-medium text-accent">
                          <Icon name="check" size={11} strokeWidth={2.5} /> You
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                          → {d.topSource}
                        </span>
                      )}
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
          Gaps = high demand where you&apos;re under-cited. LotPilot prioritizes these first — no
          action needed from your team.
        </p>
      </Card>
      </>
      )}
    </Shell>
  );
}
