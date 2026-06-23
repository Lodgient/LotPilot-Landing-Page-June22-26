import Icon from "@/components/Icon";
import type { ForecastRow } from "@/lib/dashboard/types";

function fmt(v: number, unit: ForecastRow["unit"]) {
  if (unit === "usd") return `$${Math.round(v).toLocaleString()}`;
  if (unit === "count") return Math.round(v).toLocaleString();
  return String(Math.round(v));
}

export default function Forecast({ items }: { items: ForecastRow[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((f) => {
        const delta = f.projected - f.current;
        const pct = f.current ? Math.round((delta / f.current) * 100) : 0;
        return (
          <div key={f.metric} className="rounded-xl border border-line bg-black/[0.02] p-4">
            <p className="text-xs text-ink-muted">{f.metric}</p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-sm text-ink-faint tabular-nums">{fmt(f.current, f.unit)}</span>
              <Icon name="arrow-right" size={13} className="text-ink-faint" />

              <span className="text-xl font-bold tabular-nums text-gradient">
                {fmt(f.projected, f.unit)}
              </span>
            </div>
            <span className="mt-1 inline-block rounded-md bg-accent/12 px-1.5 py-0.5 text-[11px] font-medium text-accent">
              ▲ {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
