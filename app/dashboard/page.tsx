import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import Shell from "@/components/dashboard/Shell";
import { Card, PanelHeading, StatCard, Badge } from "@/components/dashboard/ui";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import Recommendations from "@/components/dashboard/Recommendations";
import ScoreRing from "@/components/audit/ScoreRing";
import { Sparkline } from "@/components/dashboard/charts";
import CountUp from "@/components/dashboard/CountUp";
import Greeting from "@/components/dashboard/Greeting";
import OnboardingChecklist, { type OnboardingStep } from "@/components/dashboard/OnboardingChecklist";
import { cn } from "@/lib/cn";
import {
  requireDealer,
  getKpis,
  getActivity,
  getVisibility,
  getVisibilityMonitor,
  getLeads,
  getOvernightSummary,
  getRecommendations,
  getAgentConfig,
} from "@/lib/dashboard/queries";

export const dynamic = "force-dynamic";

export default async function CommandCenter() {
  const { dealer, profile } = await requireDealer();
  const [kpis, activity, visibility, monitor, leads, overnight, recommendations, agent] =
    await Promise.all([
      getKpis("today"),
      getActivity(),
      getVisibility(),
      getVisibilityMonitor(dealer.id),
      getLeads(),
      getOvernightSummary(),
      getRecommendations(),
      getAgentConfig(dealer.id),
    ]);
  const hot = leads.filter((l) => l.temp === "Hot");
  const isFresh = kpis.length === 0 && activity.length === 0;

  // First-run activation checklist — lights up as each connector fills data in.
  const firstName = profile.fullName.split(" ")[0] ?? "";
  const feedDone = (dealer.vehicles ?? 0) > 0 || !!dealer.feedType;
  const scanDone = !!visibility;
  const agentDone = agent?.status === "active";
  const onboardSteps: OnboardingStep[] = [
    {
      title: "Workspace created",
      desc: `${dealer.name} is live on LotPilot.`,
      icon: "check",
      status: "done",
    },
    {
      title: "Connect your inventory feed",
      desc: "Send the export you already produce — vAuto, HomeNet, Dealer.com or CSV.",
      icon: "globe",
      status: feedDone ? "done" : "active",
      href: "/#feed",
      cta: "Connect feed",
    },
    {
      title: "We rebuild your VINs & run the first scan",
      desc: "Every car becomes AI-readable, then tested across the answer engines.",
      icon: "radar",
      status: scanDone ? "done" : feedDone ? "active" : "todo",
      href: "/dashboard/visibility",
      cta: "Run first scan",
    },
    {
      title: "Turn on your AI Sales Agent",
      desc: "Optional add-on — most dealers add Ava once the first leads start coming in.",
      icon: "bolt",
      status: agentDone ? "done" : "todo",
      href: "/dashboard/assistant",
      cta: "Set up Ava",
      optional: true,
    },
  ];
  // Setup is "done" once the required steps are complete — the agent is optional.
  const onboarded =
    dealer.id === "11111111-1111-1111-1111-111111111111" ||
    onboardSteps.filter((s) => !s.optional).every((s) => s.status === "done");

  // Surface the most urgent AI-visibility signal as a top banner (spec §8.3).
  const trend = visibility?.trend ?? [];
  const score = visibility?.score ?? trend[trend.length - 1] ?? 0;
  const weekDelta = trend.length >= 2 ? trend[trend.length - 1] - trend[trend.length - 2] : 0;
  const gapQueries = monitor.queries.filter((q) => q.competitor).length;
  const totalQ = monitor.queries.length;

  const alert: {
    tone: "danger" | "warn" | "accent";
    icon: IconName;
    msg: string;
    cta: string;
    href: string;
  } | null = visibility && score < 15
    ? {
        tone: "danger",
        icon: "radar",
        msg: `You're nearly invisible in AI search — only ${score}/100. Buyers asking AI which car to buy aren't seeing ${dealer.name}.`,
        cta: "See the gaps",
        href: "/dashboard/visibility",
      }
    : weekDelta <= -5
      ? {
          tone: "danger",
          icon: "trending",
          msg: `Your AI Visibility dropped ${Math.abs(weekDelta)} pts this week — a competitor may be gaining ground.`,
          cta: "See what changed",
          href: "/dashboard/visibility/history",
        }
      : gapQueries > 0
        ? {
            tone: "warn",
            icon: "radar",
            msg: `AI is routing ${gapQueries} of ${totalQ} buyer searches in your market to competitors right now.`,
            cta: "See who's winning",
            href: "/dashboard/visibility/competitors",
          }
        : weekDelta >= 5
          ? {
              tone: "accent",
              icon: "trending",
              msg: `Up ${weekDelta} pts this week — your AI visibility is climbing.`,
              cta: "View trend",
              href: "/dashboard/visibility/history",
            }
          : null;

  const ALERT_TONE: Record<string, string> = {
    danger: "border-danger/30 bg-danger/[0.06] text-danger",
    warn: "border-warn/30 bg-warn/[0.06] text-warn",
    accent: "border-accent/30 bg-accent/[0.06] text-accent",
  };

  if (isFresh) {
    return (
      <Shell
        dealer={dealer}
        profile={profile}
        title={`Welcome, ${profile.fullName.split(" ")[0]}`}
        intro={`Let's get ${dealer.name} discoverable in AI.`}
      >
        <OnboardingChecklist firstName={firstName} dealerName={dealer.name} steps={onboardSteps} />
        <p className="mt-4 text-center text-xs text-ink-faint">
          As soon as your feed connects, this dashboard fills with live per-VIN visibility, demand
          and attribution.
        </p>
      </Shell>
    );
  }

  return (
    <Shell
      dealer={dealer}
      profile={profile}
      title={<Greeting name={profile.fullName.split(" ")[0]} />}
      intro={`Here's what your AI did for ${dealer.name}.`}
    >
      {/* Still activating? Keep the checklist on top until every step is done. */}
      {!onboarded && (
        <div className="mb-6">
          <OnboardingChecklist firstName={firstName} dealerName={dealer.name} steps={onboardSteps} />
        </div>
      )}

      {/* AI-visibility alert — the most urgent signal, first thing seen */}
      {alert && (
        <Link
          href={alert.href}
          className={cn(
            "mb-6 flex flex-wrap items-center gap-3 rounded-2xl border p-4 transition-colors hover:brightness-[0.99]",
            ALERT_TONE[alert.tone],
          )}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-black/[0.05]">
            <Icon name={alert.icon} size={18} />
          </span>
          <p className="min-w-0 flex-1 text-sm font-medium text-ink">{alert.msg}</p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold">
            {alert.cta} <Icon name="arrow-right" size={15} />
          </span>
        </Link>
      )}

      {/* While you slept */}
      <Card glow className="relative overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan via-accent to-violet"
        />
        <div className="glow-cyan pointer-events-none absolute -right-10 -top-16 h-56 w-56 opacity-50" />
        <div data-tour="gross" className="relative grid gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Badge tone="cyan">● While you slept</Badge>
              <span className="text-xs text-ink-faint">Since 6:00 PM yesterday</span>
            </div>

            {/* North-star: gross influenced overnight */}
            <p className="mt-4 text-sm font-medium text-ink-muted">
              AI-influenced gross overnight
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <span className="font-display text-gradient text-5xl tracking-tight sm:text-6xl">
                <CountUp value={overnight.grossInfluenced ?? "—"} />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-xs font-medium text-accent">
                ▲ 2× a typical night
              </span>
            </div>

            <p className="mt-3 text-pretty text-base text-ink sm:text-lg">
              Your AI answered{" "}
              <span className="font-semibold">
                <CountUp value={String(overnight.leadsAnswered ?? "—")} /> leads
              </span>
              , booked{" "}
              <span className="font-semibold">
                <CountUp value={String(overnight.appts ?? "—")} /> appointments
              </span>{" "}
              and captured{" "}
              <span className="font-semibold">
                <CountUp value={String(overnight.creditApps ?? "—")} /> credit apps
              </span>{" "}
              — fastest reply in {overnight.fastestReply ?? "—"}.
            </p>
            <p className="mt-1 text-sm text-ink-muted">Nothing leaked while the store was closed.</p>
          </div>
          <div className="flex flex-col gap-4 lg:w-64">
            <div className="rounded-2xl border border-line bg-canvas-2/50 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                Overnight at a glance
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {(
                  [
                    { icon: "messages", label: "Leads answered", value: overnight.leadsAnswered ?? "—" },
                    { icon: "calendar", label: "Appointments", value: overnight.appts ?? "—" },
                    { icon: "file", label: "Credit apps", value: overnight.creditApps ?? "—" },
                    { icon: "bolt", label: "Fastest reply", value: overnight.fastestReply ?? "—" },
                  ] as { icon: IconName; label: string; value: string | number }[]
                ).map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-line bg-panel p-2.5 transition-colors hover:border-cyan/40"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan/12 text-cyan">
                      <Icon name={s.icon} size={14} />
                    </span>
                    <p className="mt-2 font-display text-xl leading-none text-ink [font-feature-settings:'tnum'_'lnum']">
                      {s.value}
                    </p>
                    <p className="mt-1 text-[11px] leading-tight text-ink-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/dashboard/leads"
              className="inline-flex h-11 items-center justify-center rounded-full bg-cyan px-5 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan/90 cta-glow"
            >
              Review conversations →
            </Link>
          </div>
        </div>
      </Card>

      {/* Today KPIs */}
      <div data-tour="kpis" className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {kpis.map((k) => (
          <StatCard key={k.label} kpi={k} />
        ))}
      </div>

      {/* What LotPilot handled */}
      <Card className="mt-6">
        <PanelHeading
          title="What LotPilot handled"
          sub="Revenue-impacting fixes applied automatically — for your review"
          action={
            <Link href="/dashboard/inventory" className="text-xs text-cyan hover:underline">
              See inventory
            </Link>
          }
        />
        <Recommendations items={recommendations} />
      </Card>

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
          <ActivityFeed events={activity} />
        </Card>

        <div className="space-y-6">
          {/* Visibility snapshot */}
          {visibility && (
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
                <ScoreRing score={visibility.score} band={visibility.band} size={132} />
                <div>
                  <p className="text-sm text-ink-soft">
                    Up <span className="font-semibold text-accent">+{visibility.delta} pts</span>{" "}
                    since you connected your feed.
                  </p>
                  <div className="mt-3">
                    <Sparkline data={visibility.trend} accent="accent" width={150} height={42} />
                  </div>
                  <p className="mt-1 text-xs text-ink-faint">12-week trend</p>
                </div>
              </div>
            </Card>
          )}

          {/* Hot buyers to review */}
          <Card>
            <PanelHeading title="Hot buyers to review" sub={`${hot.length} ready for a human close`} />
            {hot.length === 0 ? (
              <p className="rounded-xl border border-line bg-black/[0.02] px-4 py-6 text-center text-sm text-ink-muted">
                No hot buyers right now — your AI is working every lead. We&apos;ll flag any that are
                ready for your team here.
              </p>
            ) : (
            <ul className="space-y-2.5">
              {hot.map((l) => (
                <li key={l.id}>
                  <Link
                    href="/dashboard/leads"
                    className="flex items-center gap-3 rounded-xl border border-line bg-black/[0.02] p-3 transition-colors hover:border-cyan/40 hover:bg-black/[0.04]"
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
            )}
          </Card>
        </div>
      </div>
    </Shell>
  );
}
