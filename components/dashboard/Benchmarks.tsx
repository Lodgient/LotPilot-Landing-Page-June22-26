import type { Benchmark } from "@/lib/dashboard/types";

function fmt(v: number, unit: Benchmark["unit"]) {
  if (unit === "pct") return `${v}%`;
  if (unit === "sec") return `${v}s`;
  if (unit === "usd") return `$${v.toLocaleString()}`;
  if (unit === "count") return v.toLocaleString();
  return String(v);
}

export default function Benchmarks({ items }: { items: Benchmark[] }) {
  return (
    <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
      {items.map((b) => {
        const topPct = 100 - b.percentile;
        return (
          <div key={b.metric}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-ink-soft">{b.metric}</span>
              <span className="rounded-md bg-accent/12 px-2 py-0.5 text-xs font-medium text-accent">
                Top {topPct}% of dealers
              </span>
            </div>
            {/* percentile track */}
            <div className="relative h-2.5 w-full rounded-full bg-white/[0.06]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan to-accent"
                style={{ width: `${b.percentile}%` }}
              />
              {/* peer median marker at 50th percentile */}
              <span
                className="absolute top-1/2 h-3.5 w-px -translate-y-1/2 bg-ink-faint"
                style={{ left: "50%" }}
                title="Peer median"
              />
              <span
                className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-ink shadow-[0_0_8px] shadow-accent"
                style={{ left: `calc(${b.percentile}% - 2px)` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-ink">
                You: <span className="font-semibold">{fmt(b.yourValue, b.unit)}</span>
              </span>
              <span className="text-ink-faint">Peer median {fmt(b.peerMedian, b.unit)}</span>
              <span className="text-ink-muted">Top {fmt(b.peerTop, b.unit)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
