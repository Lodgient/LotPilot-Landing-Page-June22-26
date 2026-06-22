"use client";

import { useEffect, useRef, useState } from "react";

// Animated count-up that preserves any prefix/suffix in the source string,
// e.g. "$31,400", "18s", "23". Starts at 0 on mount and tweens to the target.
// Respects prefers-reduced-motion (renders the final value immediately).
export default function CountUp({
  value,
  durationMs = 900,
  className,
}: {
  value: string;
  durationMs?: number;
  className?: string;
}) {
  // Split into leading non-numeric prefix, the number, and trailing suffix.
  const match = value.match(/^(\D*)([\d,]*\.?\d+)(.*)$/);
  const prefix = match?.[1] ?? "";
  const numRaw = match?.[2] ?? "";
  const suffix = match?.[3] ?? "";
  const target = numRaw ? parseFloat(numRaw.replace(/,/g, "")) : NaN;
  const hasGrouping = numRaw.includes(",");
  const decimals = numRaw.includes(".") ? (numRaw.split(".")[1]?.length ?? 0) : 0;

  const [n, setN] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(target)) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic for a confident, decelerating count
      const eased = 1 - Math.pow(1 - t, 3);
      setN(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, durationMs]);

  // If the source isn't a number we can animate, just render it verbatim.
  if (Number.isNaN(target)) return <span className={className}>{value}</span>;

  const display = n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: hasGrouping,
  });

  return (
    <span className={className} suppressHydrationWarning>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
