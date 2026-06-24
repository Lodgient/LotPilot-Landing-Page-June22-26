import Link from "next/link";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import { PrintButton } from "@/components/dashboard/Exports";
import {
  requireDealer,
  getVisibility,
  getAttributionByEngine,
  getVisibilityMonitor,
  getKpis,
  getCustomersOwned,
  getVehicles,
} from "@/lib/dashboard/queries";
import { ENGINES } from "@/lib/dashboard/types";

export const dynamic = "force-dynamic";

const money = (n: number) => "$" + Math.round(n).toLocaleString();
const short = (e: string) => e.replace(" AI Overviews", " AIO").replace("Bing ", "");
const band = (s: number) =>
  s >= 70 ? "var(--color-accent)" : s >= 40 ? "var(--color-warn)" : "var(--color-danger)";

export default async function BoardReportPage() {
  const { dealer, profile } = await requireDealer();
  const [visibility, byEngine, monitor, kpis, owned, vehicles] = await Promise.all([
    getVisibility(),
    getAttributionByEngine(),
    getVisibilityMonitor(dealer.id),
    getKpis("roi"),
    getCustomersOwned(),
    getVehicles(),
  ]);

  const totalGross = byEngine.reduce((s, e) => s + e.gross, 0);
  const maxGross = Math.max(...byEngine.map((e) => e.gross), 1);
  const cost = 1098; // $/mo all-in — $399 Visibility + $699 Sales Agent
  const roiMultiple = Math.max(1, Math.round(totalGross / cost));
  const score = visibility?.score ?? 0;
  // Inventory Citation Rate — the headline visibility metric (product doc §4.3).
  const totalVins = vehicles.length;
  const citedVins = vehicles.filter((v) => v.enginesCiting > 0).length;
  const citationRate = totalVins ? Math.round((citedVins / totalVins) * 100) : 0;
  const queries = monitor.queries;
  const totalQ = queries.length;

  // top shadow competitors (derived; maps to ai_shadow_competitors when live)
  const cmap = new Map<string, number>();
  for (const q of queries) if (q.competitor) cmap.set(q.competitor, (cmap.get(q.competitor) ?? 0) + 1);
  const competitors = [...cmap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  const now = new Date();
  const period = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const generated = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 print:py-0">
      {/* toolbar (screen only) */}
      <div className="no-print mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/roi"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <Icon name="arrow-right" size={14} className="rotate-180" />
          Back to ROI
        </Link>
        <PrintButton label="Print / Save PDF" />
      </div>

      {/* report */}
      <article className="rounded-2xl border border-line bg-panel p-6 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-4 border-b border-line pb-5">
          <Logo />
          <div className="text-right">
            <p className="text-sm font-semibold text-ink">AI Visibility &amp; ROI Report</p>
            <p className="text-xs text-ink-muted">
              {dealer.name} · {dealer.metro}
            </p>
            <p className="text-[11px] text-ink-faint">
              {period} · generated {generated}
            </p>
          </div>
        </header>

        {/* the bottom line */}
        <section className="mt-6 break-inside-avoid rounded-xl border border-accent/25 bg-accent/[0.05] p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-ink-faint">The bottom line</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="font-display text-3xl text-ink">{money(totalGross)}</p>
              <p className="text-xs text-ink-muted">AI-influenced front gross</p>
            </div>
            <div>
              <p className="font-display text-3xl text-accent">{roiMultiple}×</p>
              <p className="text-xs text-ink-muted">return on {money(cost)}/mo all-in</p>
            </div>
            <div>
              <p className="font-display text-3xl text-ink">{owned}</p>
              <p className="text-xs text-ink-muted">customers you own outright</p>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="mt-6 break-inside-avoid">
          <p className="mb-3 text-sm font-semibold text-ink">This period</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {kpis.slice(0, 4).map((k) => (
              <div key={k.label} className="rounded-xl border border-line bg-black/[0.02] p-3">
                <p className="text-xl font-bold tabular-nums text-ink">{k.value}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{k.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AI visibility */}
        <section className="mt-6 break-inside-avoid">
          <p className="mb-3 text-sm font-semibold text-ink">AI visibility</p>
          <div className="grid gap-4 rounded-xl border border-line bg-black/[0.02] p-5 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="text-center">
              <p className="font-display text-4xl [font-feature-settings:'tnum'_'lnum']" style={{ color: band(citationRate) }}>
                {citationRate}
                <span className="align-top text-base font-semibold text-ink-faint">%</span>
              </p>
              <p className="text-[11px] text-ink-muted">
                Inventory Citation Rate
                <br />
                <span className="text-ink-faint">
                  {citedVins}/{totalVins} VINs · AVTS {score}/100
                </span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 sm:grid-cols-3">
              {ENGINES.map((e) => {
                const cited = queries.filter((q) => q.engines[e]).length;
                const pct = totalQ ? Math.round((cited / totalQ) * 100) : 0;
                return (
                  <div key={e} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-ink-soft">{short(e)}</span>
                    <span className="font-semibold tabular-nums" style={{ color: band(pct) }}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* attribution by engine */}
        <section className="mt-6 break-inside-avoid">
          <p className="mb-3 text-sm font-semibold text-ink">
            Attribution by AI engine · {money(totalGross)} traced to AI
          </p>
          <div className="space-y-2">
            {byEngine.map((e) => (
              <div key={e.engine} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm text-ink-soft">{e.engine}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan to-violet"
                    style={{ width: `${(e.gross / maxGross) * 100}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-sm tabular-nums text-ink-soft">
                  {money(e.gross)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* competitors */}
        {competitors.length > 0 && (
          <section className="mt-6 break-inside-avoid">
            <p className="mb-3 text-sm font-semibold text-ink">Competitors AI surfaced instead</p>
            <div className="flex flex-wrap gap-2">
              {competitors.map(([name, n]) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-md border border-danger/30 bg-danger/10 px-2.5 py-1 text-xs text-danger"
                >
                  {name}
                  <span className="font-semibold">· {n}</span>
                </span>
              ))}
              <span className="px-1 py-1 text-xs text-ink-faint">
                across {queries.filter((q) => q.competitor).length} of {totalQ} tracked searches
              </span>
            </div>
          </section>
        )}

        <footer className="mt-8 border-t border-line pt-4 text-[11px] text-ink-faint">
          Prepared for {profile.fullName || dealer.name} · Delaware C-Corp · FCRA-aligned · US data
          only · You own every customer — no reselling. © {now.getFullYear()} LotPilot.
        </footer>
      </article>
    </main>
  );
}
