import Link from "next/link";
import Shell from "@/components/dashboard/Shell";
import Icon, { type IconName } from "@/components/Icon";
import { Card, PanelHeading, Badge } from "@/components/dashboard/ui";
import { LineChart } from "@/components/dashboard/charts";
import { requireDealer, getVisibility } from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

const band = (s: number) =>
  s >= 70 ? "var(--color-accent)" : s >= 40 ? "var(--color-warn)" : "var(--color-danger)";

function Tile({
  icon,
  label,
  value,
  color,
}: {
  icon: IconName;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Card className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan/12 text-cyan ring-1 ring-inset ring-cyan/20">
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="font-display text-[26px] leading-none text-ink [font-feature-settings:'tnum'_'lnum']" style={color ? { color } : undefined}>
          {value}
        </p>
        <p className="text-xs text-ink-muted">{label}</p>
      </div>
    </Card>
  );
}

export default async function VisibilityHistoryPage() {
  const { dealer, profile } = await requireDealer();
  const visibility = await getVisibility();
  const trend = visibility?.trend ?? [];

  const current = trend[trend.length - 1] ?? visibility?.score ?? 0;
  const first = trend[0] ?? current;
  const change = current - first;
  const best = trend.length ? Math.max(...trend) : current;
  const max = Math.max(best, 1);

  const rows = trend
    .map((score, i) => ({
      score,
      delta: i > 0 ? score - trend[i - 1] : 0,
      weeksAgo: trend.length - 1 - i,
    }))
    .reverse();

  const weekLabel = (w: number) => (w === 0 ? "This week" : `${w} week${w > 1 ? "s" : ""} ago`);

  return (
    <Shell
      dealer={dealer}
      profile={profile}
      title="AI Visibility · History"
      intro="How your AI visibility has trended since you connected your feed."
    >
      <Link
        href="/dashboard/visibility"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <Icon name="arrow-right" size={14} className="rotate-180" />
        Back to AI Visibility
      </Link>

      {trend.length === 0 ? (
        <Card glow className="relative mt-4 overflow-hidden text-center">
          <div className="relative mx-auto max-w-lg py-6">
            <Badge tone="cyan">● No scans yet</Badge>
            <h2 className="mt-4 font-display text-3xl text-ink">
              Your visibility trend will build here.
            </h2>
            <p className="mt-3 text-sm text-ink-muted">
              Run your first scan on the AI Visibility page — every scan adds a point to this trend
              so you can see your score climb as LotPilot closes the gaps.
            </p>
            <Link
              href="/dashboard/visibility"
              className="mt-6 inline-flex h-11 items-center rounded-full bg-cyan px-6 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan/90 cta-glow"
            >
              Go to AI Visibility →
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Tile icon="target" label="Current score" value={`${current}/100`} color={band(current)} />
            <Tile
              icon="trending"
              label="Since you connected"
              value={`${change >= 0 ? "+" : ""}${change} pts`}
              color={change >= 0 ? "var(--color-accent)" : "var(--color-danger)"}
            />
            <Tile icon="chart" label="Best week" value={`${best}/100`} color={band(best)} />
            <Tile icon="radar" label="Scans run" value={String(trend.length)} />
          </div>

          <Card className="mt-6">
            <PanelHeading title="Score over time" sub={`Last ${trend.length} weeks`} />
            <LineChart data={trend} accent="accent" height={220} />
            <div className="mt-2 flex justify-between text-xs text-ink-faint">
              <span>{trend.length} wks ago</span>
              <span>Today</span>
            </div>
          </Card>

          <Card className="mt-6 p-0">
            <div className="p-5 sm:p-6">
              <PanelHeading title="Scan history" sub="Every weekly scan, newest first" />
            </div>
            <div className="overflow-x-auto scroll-slim">
              <table className="w-full min-w-[420px] border-collapse">
                <thead>
                  <tr className="text-xs text-ink-faint">
                    <th className="px-5 py-3 text-left font-medium">Week</th>
                    <th className="px-3 py-3 text-center font-medium">Score</th>
                    <th className="px-3 py-3 text-center font-medium">Change</th>
                    <th className="px-3 py-3 text-left font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.weeksAgo} className="border-t border-line">
                      <td className="px-5 py-3 text-sm text-ink-soft">{weekLabel(r.weeksAgo)}</td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className="text-sm font-semibold tabular-nums"
                          style={{ color: band(r.score) }}
                        >
                          {r.score}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-sm tabular-nums">
                        {r.weeksAgo === rows.length - 1 ? (
                          <span className="text-ink-faint">—</span>
                        ) : (
                          <span className={r.delta >= 0 ? "text-accent" : "text-danger"}>
                            {r.delta >= 0 ? "▲" : "▼"} {Math.abs(r.delta)}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(r.score / max) * 100}%`, background: band(r.score) }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </Shell>
  );
}
