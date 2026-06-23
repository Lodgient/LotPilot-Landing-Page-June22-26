import Icon from "@/components/Icon";
import type { Recommendation } from "@/lib/dashboard/types";

// Parse "$8.1k", "$1,200" etc. from an impact string into a dollar number.
function parseDollars(s: string): number {
  const k = s.match(/\$\s*([\d.]+)\s*k/i);
  if (k) return Math.round(parseFloat(k[1]) * 1000);
  const n = s.match(/\$\s*([\d,]+)/);
  return n ? parseInt(n[1].replace(/,/g, ""), 10) : 0;
}
function parseLeads(s: string): number {
  const m = s.match(/\+\s*(\d+)\s*AI leads/i);
  return m ? parseInt(m[1], 10) : 0;
}
function money(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;
}

// Full autopilot: LotPilot applies every improvement automatically. The dealer
// reviews outcomes — there are no buttons to press. "applied" reads as done,
// anything still open is actively being worked.
function StatusChip({ done }: { done: boolean }) {
  return done ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
      <Icon name="check" size={13} strokeWidth={2.25} /> Done
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan">
      <Icon name="bolt" size={12} strokeWidth={2.25} /> Auto-applying
    </span>
  );
}

function Item({ r }: { r: Recommendation }) {
  const done = r.status === "applied";
  return (
    <li className="rounded-xl border border-line bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip done={done} />
        <span className="text-xs text-ink-faint">{r.category}</span>
        <span className="ml-auto rounded-md bg-accent/12 px-2 py-0.5 text-xs font-medium text-accent">
          {r.impact}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-ink">{r.title}</p>
      <p className="mt-1 text-sm text-ink-muted">{r.detail}</p>
    </li>
  );
}

export default function Recommendations({ items }: { items: Recommendation[] }) {
  const dollars = items.reduce((s, r) => s + parseDollars(r.impact), 0);
  const leads = items.reduce((s, r) => s + parseLeads(r.impact), 0);
  const doneCount = items.filter((r) => r.status === "applied").length;
  const working = items.length - doneCount;

  return (
    <div>
      {/* Outcome bar — what LotPilot already did, not a queue to action */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-accent/20 bg-accent/[0.05] px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">
            LotPilot handled {items.length} improvements ·{" "}
            <span className="text-gradient">
              {money(dollars)} gross
              {leads ? ` + ${leads} AI leads/mo` : ""}
            </span>{" "}
            recovered
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">
            Applied automatically — nothing for your team to do.
          </p>
        </div>
        <span className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-4 text-xs font-semibold text-accent">
          <Icon name="bolt" size={14} strokeWidth={2.25} />
          {working > 0 ? `${doneCount} done · ${working} in progress` : "Autopilot on"}
        </span>
      </div>

      <ul className="space-y-3">
        {items.map((r) => (
          <Item key={r.id} r={r} />
        ))}
      </ul>
    </div>
  );
}
