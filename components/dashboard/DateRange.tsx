"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const RANGES: [string, string][] = [
  ["7d", "Last 7 days"],
  ["30d", "Last 30 days"],
  ["90d", "Last 90 days"],
  ["qtd", "Quarter to date"],
  ["ytd", "Year to date"],
];

export default function DateRange() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get("range") ?? "30d";

  function set(v: string) {
    const params = new URLSearchParams(sp.toString());
    params.set("range", v);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <select
      aria-label="Date range"
      value={current}
      onChange={(e) => set(e.target.value)}
      className="hidden h-9 rounded-lg border border-line-strong bg-white/[0.03] px-2.5 text-sm text-ink-soft focus:border-cyan/60 focus:outline-none sm:block"
    >
      {RANGES.map(([v, label]) => (
        <option key={v} value={v} className="bg-panel text-ink">
          {label}
        </option>
      ))}
    </select>
  );
}
