import { cn } from "@/lib/cn";

const ACCENT_VAR: Record<string, string> = {
  accent: "var(--color-accent)",
  cyan: "var(--color-cyan)",
  violet: "var(--color-violet)",
  warn: "var(--color-warn)",
  danger: "var(--color-danger)",
};

/* ------------------------------- Sparkline (area) ---------------------------- */

export function Sparkline({
  data,
  accent = "cyan",
  width = 120,
  height = 36,
}: {
  data: number[];
  accent?: keyof typeof ACCENT_VAR;
  width?: number;
  height?: number;
}) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1 || 1);
  const pts = data.map((d, i) => {
    const x = i * stepX;
    const y = height - ((d - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const color = ACCENT_VAR[accent];
  const id = `sp-${accent}-${Math.round(data[0])}-${data.length}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color} />
    </svg>
  );
}

/* ---------------------------------- TrendPill -------------------------------- */

export function TrendPill({ value, invert = false }: { value: number; invert?: boolean }) {
  const up = value >= 0;
  // For metrics where lower is better (e.g. cost, speed), invert the color logic.
  const good = invert ? !up : up;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
        good ? "bg-accent/12 text-accent" : "bg-danger/12 text-danger",
      )}
    >
      {up ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  );
}

/* --------------------------------- ProgressBar ------------------------------- */

export function ProgressBar({
  value,
  accent = "cyan",
}: {
  value: number;
  accent?: keyof typeof ACCENT_VAR;
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: ACCENT_VAR[accent] }}
      />
    </div>
  );
}

/* ----------------------------------- Donut ----------------------------------- */

export function Donut({
  segments,
  size = 180,
  thickness = 22,
  centerLabel,
  centerSub,
}: {
  segments: { name: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;

  // Precompute each segment's dash length and starting offset (no render-time mutation).
  const arcs = segments.map((seg, i) => {
    const dash = (seg.value / total) * c;
    const offset = segments
      .slice(0, i)
      .reduce((sum, s) => sum + (s.value / total) * c, 0);
    return { ...seg, dash, offset };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {arcs.map((seg) => (
          <circle
            key={seg.name}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={`${seg.dash} ${c - seg.dash}`}
            strokeDashoffset={-seg.offset}
          />
        ))}
      </svg>
      {(centerLabel || centerSub) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerLabel && <span className="text-2xl font-bold tracking-tight">{centerLabel}</span>}
          {centerSub && <span className="text-xs text-ink-muted">{centerSub}</span>}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- Funnel ----------------------------------- */

export function Funnel({ stages }: { stages: { stage: string; value: number }[] }) {
  const max = Math.max(...stages.map((s) => s.value)) || 1;
  return (
    <div className="space-y-2.5">
      {stages.map((s, i) => {
        const pct = (s.value / max) * 100;
        const conv = i === 0 ? 100 : Math.round((s.value / stages[0].value) * 100);
        return (
          <div key={s.stage} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-right text-xs text-ink-muted sm:w-36">{s.stage}</span>
            <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-white/[0.04]">
              <div
                className="flex h-full items-center rounded-lg bg-gradient-to-r from-cyan/70 to-violet/60 px-3 text-xs font-semibold text-ink-inverse"
                style={{ width: `${Math.max(pct, 14)}%` }}
              >
                {s.value}
              </div>
            </div>
            <span className="w-10 shrink-0 text-xs tabular-nums text-ink-faint">{conv}%</span>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------- Line chart -------------------------------- */

export function LineChart({
  data,
  accent = "cyan",
  height = 160,
}: {
  data: number[];
  accent?: keyof typeof ACCENT_VAR;
  height?: number;
}) {
  const width = 560;
  const min = Math.min(...data, 0);
  const max = Math.max(...data, 100);
  const range = max - min || 1;
  const stepX = width / (data.length - 1 || 1);
  const pts = data.map((d, i) => {
    const x = i * stepX;
    const y = height - ((d - min) / range) * (height - 12) - 6;
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const color = ACCENT_VAR[accent];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id="lc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={width} y1={height * g} y2={height * g} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#lc)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
