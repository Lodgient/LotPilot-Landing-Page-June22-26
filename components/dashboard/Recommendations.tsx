import { Badge } from "./ui";
import type { Recommendation } from "@/lib/dashboard/types";

const PRIORITY_TONE: Record<string, "danger" | "warn" | "neutral"> = {
  High: "danger",
  Medium: "warn",
  Low: "neutral",
};

export default function Recommendations({ items }: { items: Recommendation[] }) {
  return (
    <ul className="space-y-3">
      {items.map((r) => (
        <li
          key={r.title}
          className="rounded-xl border border-line bg-white/[0.02] p-4 transition-colors hover:border-cyan/30"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={PRIORITY_TONE[r.priority]}>{r.priority}</Badge>
            <span className="text-xs text-ink-faint">{r.category}</span>
            <span className="ml-auto rounded-md bg-accent/12 px-2 py-0.5 text-xs font-medium text-accent">
              {r.impact}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-ink">{r.title}</p>
          <p className="mt-1 text-sm text-ink-muted">{r.detail}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-md border border-line px-2 py-1 text-[11px] text-ink-muted">
              Effort: {r.effort}
            </span>
            <button className="ml-auto inline-flex h-9 items-center rounded-full bg-cyan px-4 text-xs font-semibold text-ink-inverse transition-colors hover:bg-cyan/90">
              Apply with LotPilot →
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
