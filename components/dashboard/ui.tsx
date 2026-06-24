import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Icon, { type IconName } from "@/components/Icon";
import { Sparkline, TrendPill } from "./charts";
import CountUp from "./CountUp";
import type { KPI } from "@/lib/dashboard/types";

// Map a KPI label to a fitting line icon (keyword match, safe default).
function kpiIcon(label: string): IconName {
  const l = label.toLowerCase();
  if (l.includes("appoint") || l.includes("appt")) return "calendar";
  if (l.includes("credit") || l.includes("app")) return "file";
  if (l.includes("speed") || l.includes("reply") || l.includes("fast") || l.includes("time"))
    return "bolt";
  if (l.includes("sale") || l.includes("attribut") || l.includes("revenue") || l.includes("cost"))
    return "chart";
  if (l.includes("visib") || l.includes("rank")) return "target";
  return "sparkles";
}

const ACCENT_CHIP: Record<NonNullable<KPI["accent"]>, string> = {
  cyan: "bg-cyan/12 text-cyan ring-cyan/20",
  accent: "bg-accent/12 text-accent ring-accent/20",
  violet: "bg-violet/15 text-violet ring-violet/20",
  warn: "bg-warn/12 text-warn ring-warn/20",
};

export function Card({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div className={cn("surface rounded-2xl p-5 sm:p-6", glow && "ring-gradient", className)}>
      {children}
    </div>
  );
}

export function PanelHeading({
  title,
  sub,
  action,
}: {
  title: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-[19px] leading-tight text-ink">{title}</h2>
        {sub && <p className="mt-1 text-sm text-ink-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ kpi }: { kpi: KPI }) {
  const accent = kpi.accent ?? "cyan";
  return (
    <Card className="surface-hover flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "grid h-8 w-8 place-items-center rounded-lg ring-1 ring-inset",
              ACCENT_CHIP[accent],
            )}
          >
            <Icon name={kpiIcon(kpi.label)} size={16} />
          </span>
          <span className="text-sm text-ink-muted">{kpi.label}</span>
        </div>
        {typeof kpi.trend === "number" && (
          <div className="flex flex-col items-end">
            <TrendPill value={kpi.trend} invert={kpi.invertTrend} />
            <span className="mt-1 text-[10px] text-ink-faint">vs prev. 30 days</span>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="font-display text-[32px] leading-none text-ink [font-feature-settings:'tnum'_'lnum']">
            <CountUp value={kpi.value} />
          </div>
          {kpi.sub && <div className="mt-0.5 text-xs text-ink-muted">{kpi.sub}</div>}
        </div>
        {kpi.spark && <Sparkline data={kpi.spark} accent={kpi.accent ?? "cyan"} />}
      </div>
    </Card>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "cyan" | "violet" | "warn" | "danger";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-black/[0.06] text-ink-soft border-line",
    accent: "bg-accent/12 text-accent border-accent/25",
    cyan: "bg-cyan/12 text-cyan border-cyan/25",
    violet: "bg-violet/15 text-violet border-violet/25",
    warn: "bg-warn/12 text-warn border-warn/25",
    danger: "bg-danger/12 text-danger border-danger/25",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-warn/30 bg-warn/10 px-2.5 py-1 text-[11px] font-medium text-warn">
      <span className="h-1.5 w-1.5 rounded-full bg-warn" />
      Demo data
    </span>
  );
}
