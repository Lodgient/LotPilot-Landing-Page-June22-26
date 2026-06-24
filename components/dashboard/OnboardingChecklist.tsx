import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";
import { Card, Badge } from "@/components/dashboard/ui";
import { cn } from "@/lib/cn";

export type StepStatus = "done" | "active" | "todo";

export interface OnboardingStep {
  title: string;
  desc: string;
  icon: IconName;
  status: StepStatus;
  href?: string;
  cta?: string;
  /** Not required to finish setup (e.g. the AI Sales Agent add-on). */
  optional?: boolean;
}

export default function OnboardingChecklist({
  firstName,
  dealerName,
  steps,
}: {
  firstName: string;
  dealerName: string;
  steps: OnboardingStep[];
}) {
  // Progress reflects only the required steps; optional add-ons don't gate setup.
  const required = steps.filter((s) => !s.optional);
  const done = required.filter((s) => s.status === "done").length;
  const pct = Math.round((done / Math.max(1, required.length)) * 100);

  return (
    <Card glow className="relative overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan via-accent to-violet"
      />
      <div className="glow-cyan pointer-events-none absolute -right-12 -top-16 h-56 w-56 opacity-50" />

      <div className="relative">
        <Badge tone="cyan">● Getting set up</Badge>
        <h2 className="mt-4 font-display text-3xl text-ink sm:text-4xl">
          Welcome{firstName ? `, ${firstName}` : ""} — let&apos;s get{" "}
          <span className="text-gradient">{dealerName}</span> found by AI.
        </h2>
        <p className="mt-2 max-w-xl text-pretty text-ink-soft">
          A few steps to your first AI-sourced lead. We do the heavy lifting — you just connect the
          feed you already export.
        </p>

        {/* progress */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-accent transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm font-medium tabular-nums text-ink-soft">
            {done}/{required.length}
          </span>
        </div>

        {/* steps */}
        <ol className="mt-6 space-y-2.5">
          {steps.map((s) => {
            const isDone = s.status === "done";
            const isOptional = !!s.optional;
            const isActive = !isOptional && s.status === "active";
            const num = required.indexOf(s) + 1;
            return (
              <li
                key={s.title}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border p-4 transition-colors",
                  isActive
                    ? "border-cyan/40 bg-cyan/[0.04] ring-1 ring-inset ring-cyan/15"
                    : "border-line bg-black/[0.02]",
                )}
              >
                {/* status marker */}
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold",
                    isDone && "bg-accent/15 text-accent",
                    !isDone && isOptional && "bg-violet/12 text-violet",
                    isActive && "bg-cyan text-white shadow-[0_4px_12px_-3px_rgba(37,99,235,0.7)]",
                    !isDone && !isOptional && !isActive && "border border-line text-ink-faint",
                  )}
                >
                  {isDone ? (
                    <Icon name="check" size={16} strokeWidth={2.5} />
                  ) : isOptional ? (
                    <Icon name={s.icon} size={16} />
                  ) : (
                    num
                  )}
                </span>

                {!isOptional && (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-black/[0.04] text-ink-soft">
                    <Icon name={s.icon} size={16} />
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <span className={isDone ? "text-ink-muted" : "text-ink"}>{s.title}</span>
                    {isOptional && (
                      <span className="rounded-full bg-violet/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet">
                        Optional
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink-muted">{s.desc}</p>
                </div>

                {isDone ? (
                  <span className="shrink-0 text-xs font-medium text-accent">Done</span>
                ) : isOptional && s.href ? (
                  <Link
                    href={s.href}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-panel px-4 text-sm font-medium text-ink transition-colors hover:border-violet/50"
                  >
                    {s.cta ?? "Add"}
                  </Link>
                ) : isActive && s.href ? (
                  <Link
                    href={s.href}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-cyan px-4 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow"
                  >
                    {s.cta ?? "Start"}
                    <Icon name="arrow-right" size={14} />
                  </Link>
                ) : (
                  <span className="shrink-0 text-xs text-ink-faint">Up next</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
}
