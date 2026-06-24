"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { ENGINES } from "@/lib/dashboard/types";
import { cn } from "@/lib/cn";

const STEPS = [
  "Crawling your inventory as an AI bot…",
  ...ENGINES.map((e) => `Querying ${e}…`),
  "Scoring visibility & competitors…",
];

/**
 * Trigger a fresh AI-visibility scan. Fires the real backend scan endpoint
 * (POST /api/ai-visibility/scans) when it exists — ignored gracefully if not —
 * and plays the scan-progress overlay, then refreshes the page to pull the new
 * scan. The "run it live on a sales call" tool from the spec.
 */
export default function RunScanButton({ label = "Run a fresh scan" }: { label?: string }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  async function run() {
    if (running) return;
    setRunning(true);
    setStep(0);

    // Kick the real scan if the backend is live; harmless no-op otherwise.
    fetch("/api/ai-visibility/scans", { method: "POST" }).catch(() => {});

    await new Promise<void>((resolve) => {
      let i = 0;
      const tick = () => {
        setStep(i);
        if (i >= STEPS.length - 1) return resolve();
        i += 1;
        timers.current.push(setTimeout(tick, 720));
      };
      tick();
    });

    await new Promise((r) => setTimeout(r, 500));
    router.refresh();
    setRunning(false);
  }

  return (
    <>
      <button
        onClick={run}
        disabled={running}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 px-4 text-sm font-semibold text-cyan transition-colors hover:bg-cyan/15 disabled:opacity-60"
      >
        <Icon name="radar" size={15} strokeWidth={2} />
        {running ? "Scanning…" : label}
      </button>

      {running && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/60" />
          <div className="surface relative w-full max-w-md rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan/12 text-cyan ring-1 ring-inset ring-cyan/25">
                <Icon name="radar" size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Scanning AI answer engines…</p>
                <p className="text-xs text-ink-muted">
                  Running buyer queries across {ENGINES.length} platforms
                </p>
              </div>
              <span className="ml-auto text-sm font-semibold tabular-nums text-ink">
                {Math.min(step + 1, STEPS.length)}/{STEPS.length}
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan to-accent transition-all duration-500"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>

            <ul className="mt-4 space-y-1.5">
              {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <li
                    key={s}
                    className={cn(
                      "flex items-center gap-2.5 text-sm transition-colors",
                      active ? "text-ink" : done ? "text-ink-muted" : "text-ink-faint",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[9px]",
                        done
                          ? "border-accent bg-accent/20 text-accent"
                          : active
                            ? "border-cyan text-cyan"
                            : "border-line text-ink-faint",
                      )}
                    >
                      {done ? "✓" : active ? <span className="pulse-dot">●</span> : ""}
                    </span>
                    {s}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
