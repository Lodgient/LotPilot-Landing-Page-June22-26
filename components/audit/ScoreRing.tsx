"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { AuditReport } from "@/lib/audit/types";

const BAND_COPY: Record<AuditReport["scoreBand"], { label: string; color: string }> = {
  critical: { label: "Critical — effectively invisible", color: "var(--color-danger)" },
  weak: { label: "Weak — rarely surfaced", color: "var(--color-warn)" },
  developing: { label: "Developing — inconsistent", color: "var(--color-cyan)" },
  strong: { label: "Strong", color: "var(--color-accent)" },
};

export default function ScoreRing({
  score,
  band,
  size = 184,
}: {
  score: number;
  band: AuditReport["scoreBand"];
  size?: number;
}) {
  const reduce = useReducedMotion();
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = c * pct;
  const meta = BAND_COPY[band];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={meta.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: reduce ? c - dash : c }}
            animate={{ strokeDashoffset: c - dash }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 10px ${meta.color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-5xl font-bold tabular-nums tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs font-mono uppercase tracking-widest text-ink-muted">
            / 100
          </span>
        </div>
      </div>
      <p
        className="mt-4 text-center text-sm font-medium"
        style={{ color: meta.color }}
      >
        {meta.label}
      </p>
    </div>
  );
}
