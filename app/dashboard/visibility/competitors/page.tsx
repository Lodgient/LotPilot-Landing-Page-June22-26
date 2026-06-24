import Link from "next/link";
import Shell from "@/components/dashboard/Shell";
import Icon, { type IconName } from "@/components/Icon";
import { Card, PanelHeading, Badge } from "@/components/dashboard/ui";
import { Donut } from "@/components/dashboard/charts";
import { requireDealer, getVisibilityMonitor, getShareOfVoice } from "@/lib/dashboard/queries";
import { ENGINES } from "@/lib/dashboard/types";

export const dynamic = "force-dynamic";

const short = (e: string) => e.replace(" AI Overviews", " AIO").replace("Bing ", "");
const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function Tile({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-danger/12 text-danger ring-1 ring-inset ring-danger/20">
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="truncate font-display text-[26px] leading-none text-ink [font-feature-settings:'tnum'_'lnum']">{value}</p>
        <p className="text-xs text-ink-muted">{label}</p>
      </div>
    </Card>
  );
}

export default async function CompetitorsPage() {
  const { dealer, profile } = await requireDealer();
  const [monitor, sov] = await Promise.all([getVisibilityMonitor(dealer.id), getShareOfVoice()]);
  const queries = monitor.queries;

  // Derive shadow competitors from the queries AI hands to someone else.
  // (Maps to ai_shadow_competitors once the bots populate it.)
  const map = new Map<
    string,
    { name: string; mentions: number; queries: string[]; engines: Set<string> }
  >();
  for (const q of queries) {
    if (!q.competitor) continue;
    const c =
      map.get(q.competitor) ??
      { name: q.competitor, mentions: 0, queries: [] as string[], engines: new Set<string>() };
    c.mentions += 1;
    c.queries.push(q.query);
    ENGINES.forEach((e) => {
      if (!q.engines[e]) c.engines.add(e);
    });
    map.set(q.competitor, c);
  }
  const competitors = [...map.values()].sort((a, b) => b.mentions - a.mentions);
  const gapQueries = queries.filter((q) => q.competitor).length;
  const you = sov.find((s) => s.value === Math.max(...sov.map((x) => x.value)));

  return (
    <Shell
      dealer={dealer}
      profile={profile}
      title="AI Visibility · Competitors"
      intro="Who AI recommends in your market — and exactly which searches they're winning."
    >
      <Link
        href="/dashboard/visibility"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <Icon name="arrow-right" size={14} className="rotate-180" />
        Back to AI Visibility
      </Link>

      {competitors.length === 0 ? (
        <Card glow className="relative mt-4 overflow-hidden text-center">
          <div className="relative mx-auto max-w-lg py-6">
            <Badge tone="accent">● You&apos;re winning</Badge>
            <h2 className="mt-4 font-display text-3xl text-ink">
              No competitor is out-citing you right now.
            </h2>
            <p className="mt-3 text-sm text-ink-muted">
              Across the buyer questions we track, AI surfaces {dealer.name} first. We&apos;ll flag
              any competitor that starts winning your searches here.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Tile icon="radar" label="Competitors tracked" value={String(competitors.length)} />
            <Tile icon="target" label="Searches they're winning" value={String(gapQueries)} />
            <Tile
              icon="chart"
              label="Your share of voice"
              value={you ? `${you.value}%` : "—"}
            />
            <Tile icon="trending" label="Top threat" value={competitors[0]?.name ?? "—"} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <Card>
              <PanelHeading title="Share of voice" sub="Who AI recommends in your market" />
              <div className="flex flex-col items-center gap-6">
                <Donut segments={sov} centerLabel={you ? `${you.value}%` : ""} centerSub="you" />
                <ul className="w-full space-y-2">
                  {sov.map((s) => (
                    <li key={s.name} className="flex items-center gap-2 text-sm">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: s.color }}
                      />
                      <span className="text-ink-soft">{s.name}</span>
                      <span className="ml-auto tabular-nums text-ink-muted">{s.value}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card>
              <PanelHeading
                title="Shadow competitors"
                sub="Stores AI surfaces instead of you — and the searches they're taking"
              />
              <div className="space-y-3">
                {competitors.map((c) => (
                  <div key={c.name} className="rounded-xl border border-line bg-black/[0.02] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-danger/15 text-xs font-semibold text-danger">
                          {initials(c.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{c.name}</p>
                          <p className="text-xs text-ink-muted">
                            winning {c.mentions} of {gapQueries} searches
                          </p>
                        </div>
                      </div>
                      <Badge tone="danger">
                        {c.mentions} {c.mentions === 1 ? "search" : "searches"}
                      </Badge>
                    </div>

                    <div className="mt-3">
                      <p className="mb-1.5 text-[11px] uppercase tracking-wider text-ink-faint">
                        Appears on
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {ENGINES.filter((e) => c.engines.has(e)).map((e) => (
                          <span
                            key={e}
                            className="rounded-md border border-danger/30 bg-danger/10 px-2 py-0.5 text-[11px] text-danger"
                          >
                            {short(e)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <p className="mb-1.5 text-[11px] uppercase tracking-wider text-ink-faint">
                        Winning these searches
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.queries.slice(0, 4).map((q) => (
                          <span
                            key={q}
                            className="rounded-md border border-line-strong bg-black/[0.03] px-2 py-0.5 text-[11px] text-ink-soft"
                          >
                            {q.length > 32 ? q.slice(0, 30) + "…" : q}
                          </span>
                        ))}
                        {c.queries.length > 4 && (
                          <span className="px-1 py-0.5 text-[11px] text-ink-faint">
                            +{c.queries.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-ink-faint">
                LotPilot is closing these gaps — as your inventory becomes the cited answer, these
                searches route back to you.
              </p>
            </Card>
          </div>
        </>
      )}
    </Shell>
  );
}
