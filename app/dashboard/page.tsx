import Link from "next/link";
import Shell from "@/components/dashboard/Shell";
import { Card, PanelHeading, StatCard, Badge } from "@/components/dashboard/ui";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import ScoreRing from "@/components/audit/ScoreRing";
import { Sparkline } from "@/components/dashboard/charts";
import {
  TODAY_KPIS,
  OVERNIGHT,
  OVERNIGHT_SUMMARY,
  VISIBILITY_SCORE,
  VISIBILITY_TREND,
  LEADS,
  DEMO_DEALER,
} from "@/lib/dashboard/data";

export default function CommandCenter() {
  const hot = LEADS.filter((l) => l.temp === "Hot");

  return (
    <Shell
      title={`Good morning, ${DEMO_DEALER.contact.split(" ")[0]}`}
      intro={`Here's what your AI did for ${DEMO_DEALER.name}.`}
    >
      {/* While you slept */}
      <Card glow className="relative overflow-hidden">
        <div className="glow-cyan pointer-events-none absolute -right-10 -top-16 h-56 w-56 opacity-50" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <Badge tone="cyan">● While you slept</Badge>
            <h2 className="mt-3 text-pretty text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Your AI answered{" "}
              <span className="text-gradient">{OVERNIGHT_SUMMARY.leadsAnswered} leads</span>,
              booked{" "}
              <span className="text-gradient">{OVERNIGHT_SUMMARY.appts} appointments</span> and
              captured{" "}
              <span className="text-gradient">{OVERNIGHT_SUMMARY.creditApps} credit apps</span>{" "}
              overnight.
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Fastest response: {OVERNIGHT_SUMMARY.fastestReply}. Nothing leaked while the store
              was closed.
            </p>
          </div>
          <div className="flex items-center gap-4 lg:flex-col lg:items-end lg:justify-center">
            <Link
              href="/dashboard/leads"
              className="inline-flex h-11 items-center rounded-full bg-cyan px-5 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan/90 cta-glow"
            >
              Review conversations →
            </Link>
          </div>
        </div>
      </Card>

      {/* Today KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TODAY_KPIS.map((k) => (
          <StatCard key={k.label} kpi={k} invertTrend={k.label === "Avg speed-to-lead"} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Activity feed */}
        <Card>
          <PanelHeading
            title="Overnight activity"
            sub="Every action your AI agent took"
            action={
              <Link href="/dashboard/leads" className="text-xs text-cyan hover:underline">
                View all
              </Link>
            }
          />
          <ActivityFeed events={OVERNIGHT} />
        </Card>

        <div className="space-y-6">
          {/* Visibility snapshot */}
          <Card>
            <PanelHeading
              title="AI Visibility"
              action={
                <Link href="/dashboard/visibility" className="text-xs text-cyan hover:underline">
                  Details
                </Link>
              }
            />
            <div className="flex items-center gap-5">
              <ScoreRing score={VISIBILITY_SCORE.score} band={VISIBILITY_SCORE.band} size={132} />
              <div>
                <p className="text-sm text-ink-soft">
                  Up{" "}
                  <span className="font-semibold text-accent">+{VISIBILITY_SCORE.delta} pts</span>{" "}
                  since you connected your feed.
                </p>
                <div className="mt-3">
                  <Sparkline data={VISIBILITY_TREND} accent="accent" width={150} height={42} />
                </div>
                <p className="mt-1 text-xs text-ink-faint">12-week trend</p>
              </div>
            </div>
          </Card>

          {/* Needs attention */}
          <Card>
            <PanelHeading title="Needs your team" sub={`${hot.length} hot buyers ready now`} />
            <ul className="space-y-2.5">
              {hot.map((l) => (
                <li key={l.id}>
                  <Link
                    href="/dashboard/leads"
                    className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-3 transition-colors hover:border-cyan/40 hover:bg-white/[0.04]"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet/20 text-xs font-semibold text-violet">
                      {l.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{l.name}</p>
                      <p className="truncate text-xs text-ink-muted">{l.vehicle}</p>
                    </div>
                    <Badge tone="accent">{l.status}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
