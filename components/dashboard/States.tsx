import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import { Card } from "@/components/dashboard/ui";
import { ENGINES } from "@/lib/dashboard/types";

const short = (e: string) => e.replace(" AI Overviews", " AIO").replace("Bing ", "");

/** No data yet — usually because the feed isn't connected. */
export function EmptyState({
  icon = "radar",
  title,
  desc,
  cta,
  href,
  secondaryCta,
  secondaryHref,
}: {
  icon?: IconName;
  title: string;
  desc: string;
  cta?: string;
  href?: string;
  secondaryCta?: string;
  secondaryHref?: string;
}) {
  return (
    <Card glow className="relative overflow-hidden text-center">
      <div className="glow-cyan pointer-events-none absolute left-1/2 -top-16 h-56 w-56 -translate-x-1/2 opacity-50" />
      <div className="relative mx-auto max-w-xl py-8">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-cyan/12 text-cyan ring-1 ring-inset ring-cyan/20">
          <Icon name={icon} size={22} />
        </span>
        <h2 className="mt-4 font-display text-2xl text-ink sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{desc}</p>
        {cta && href && (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={href}
              className="inline-flex h-11 items-center rounded-full bg-cyan px-6 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow"
            >
              {cta} →
            </Link>
            {secondaryCta && secondaryHref && (
              <Link
                href={secondaryHref}
                className="inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-sm font-medium text-ink transition-colors hover:border-cyan/50 hover:bg-black/[0.04]"
              >
                {secondaryCta}
              </Link>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/** Feed is connected — the bot is rebuilding VINs / running the first scan. */
export function ScanningState({
  title = "Scanning your inventory across the engines…",
  desc = "We rebuilt your VINs as AI-readable pages and we're testing them against the buyer questions in your market. Your first results land here shortly.",
}: {
  title?: string;
  desc?: string;
}) {
  return (
    <Card glow className="relative overflow-hidden text-center">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan via-accent to-violet"
      />
      <div className="glow-cyan pointer-events-none absolute left-1/2 -top-16 h-56 w-56 -translate-x-1/2 opacity-50" />
      <div className="relative mx-auto max-w-xl py-8">
        <span className="pulse-dot mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-cyan/12 text-cyan ring-1 ring-inset ring-cyan/20">
          <Icon name="radar" size={22} />
        </span>
        <h2 className="mt-4 font-display text-2xl text-ink sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{desc}</p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {ENGINES.map((e, i) => (
            <span
              key={e}
              className="pulse-dot inline-flex items-center gap-1.5 rounded-full border border-line bg-black/[0.02] px-2.5 py-1 text-xs text-ink-soft"
              style={{ animationDelay: `${i * 0.16}s` }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
              {short(e)}
            </span>
          ))}
        </div>

        <div className="mx-auto mt-6 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-black/[0.06]">
          <div className="lp-indeterminate h-full w-1/3 rounded-full bg-gradient-to-r from-cyan to-accent" />
        </div>
      </div>
    </Card>
  );
}

/** Per-widget source tag — flips Demo → Live as a connector goes live. */
export function DataTag({ live }: { live: boolean }) {
  return live ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent">
      <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
      Live
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-warn/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-warn">
      Demo
    </span>
  );
}
