"use client";

import { motion } from "framer-motion";
import type { PillarScore } from "@/lib/audit/types";

function barColor(score: number): string {
  if (score < 30) return "var(--color-danger)";
  if (score < 55) return "var(--color-warn)";
  return "var(--color-accent)";
}

export default function PillarBars({ pillars }: { pillars: PillarScore[] }) {
  return (
    <ul className="space-y-5">
      {pillars.map((p, i) => (
        <li key={p.key}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium text-ink-soft">{p.label}</span>
            <span
              className="text-sm font-mono tabular-nums"
              style={{ color: barColor(p.score) }}
            >
              {p.score}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: barColor(p.score) }}
              initial={{ width: 0 }}
              whileInView={{ width: `${p.score}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{p.insight}</p>
        </li>
      ))}
    </ul>
  );
}
