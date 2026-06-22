"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { generateReport } from "@/lib/audit/generateReport";
import type { AuditReport } from "@/lib/audit/types";
import ScoreRing from "./ScoreRing";
import PillarBars from "./PillarBars";
import EngineRow from "./EngineRow";
import { cn } from "@/lib/cn";

/** Cross-section trigger: the hero input dispatches this to auto-run the tool. */
export const RUN_AUDIT_EVENT = "lotpilot:run-audit";
export interface RunAuditDetail {
  url: string;
  city: string;
  dealershipName?: string;
}

type Phase = "idle" | "scanning" | "result";

const SCAN_STEPS = [
  "Crawling your vehicle pages as an AI bot…",
  "Querying ChatGPT…",
  "Querying Perplexity…",
  "Querying Gemini…",
  "Querying Google AI Overviews…",
  "Querying Bing Copilot…",
  "Scoring crawlability, schema, freshness & citations…",
];

const MODE: "demo" | "live" =
  process.env.NEXT_PUBLIC_AUDIT_MODE === "live" ? "live" : "demo";

export default function AuditTool({ compactHeader = false }: { compactHeader?: boolean }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [url, setUrl] = useState("");
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [scanIdx, setScanIdx] = useState(0);

  // Email-gate state
  const [unlocked, setUnlocked] = useState(false);
  const [gateEmail, setGateEmail] = useState("");
  const [gateName, setGateName] = useState("");
  const [gateBusy, setGateBusy] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const run = useCallback(
    async (input: { url: string; city: string; dealershipName?: string }) => {
      const cleanUrl = input.url.trim();
      if (!cleanUrl) {
        setError("Enter your dealership website to run the check.");
        return;
      }
      setError(null);
      setUnlocked(false);
      setGateError(null);
      setReport(null);
      setScanIdx(0);
      setPhase("scanning");

      // Animate the scan steps.
      clearTimers();
      SCAN_STEPS.forEach((_, i) => {
        timers.current.push(setTimeout(() => setScanIdx(i), i * 460));
      });

      // Compute / fetch the report in parallel; reveal after the scan finishes.
      const minDuration = SCAN_STEPS.length * 460 + 350;
      const started = Date.now();

      let result: AuditReport;
      if (MODE === "live") {
        try {
          const res = await fetch("/api/audit/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          });
          const data = await res.json();
          result = data.report ?? generateReport(cleanUrl, input.city, input.dealershipName);
        } catch {
          result = generateReport(cleanUrl, input.city, input.dealershipName);
        }
      } else {
        result = generateReport(cleanUrl, input.city, input.dealershipName);
      }

      const wait = Math.max(0, minDuration - (Date.now() - started));
      timers.current.push(
        setTimeout(() => {
          setReport(result);
          setPhase("result");
        }, wait),
      );
    },
    [],
  );

  // Listen for the hero-launched run.
  useEffect(() => {
    function onRun(e: Event) {
      const detail = (e as CustomEvent<RunAuditDetail>).detail;
      if (!detail) return;
      setUrl(detail.url);
      setCity(detail.city);
      if (detail.dealershipName) setName(detail.dealershipName);
      run(detail);
    }
    window.addEventListener(RUN_AUDIT_EVENT, onRun as EventListener);
    return () => window.removeEventListener(RUN_AUDIT_EVENT, onRun as EventListener);
  }, [run]);

  async function submitGate() {
    setGateError(null);
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_RE.test(gateEmail.trim())) {
      setGateError("Enter a valid work email.");
      return;
    }
    if (!gateName.trim()) {
      setGateError("Dealership name is required.");
      return;
    }
    setGateBusy(true);
    try {
      await fetch("/api/audit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: gateEmail.trim(),
          dealershipName: gateName.trim(),
          url: report?.url,
          city: report?.city,
          score: report?.score,
        }),
      });
    } catch {
      /* stub — proceed regardless so the demo never dead-ends */
    } finally {
      setGateBusy(false);
      setUnlocked(true);
    }
  }

  function reset() {
    clearTimers();
    setPhase("idle");
    setReport(null);
    setUnlocked(false);
  }

  return (
    <div className="surface relative overflow-hidden rounded-2xl">
      {/* top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />

      <div className="p-6 sm:p-8 md:p-10">
        <AnimatePresence mode="wait">
          {/* ---------------------------------------------------- IDLE */}
          {phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {!compactHeader && (
                <div className="mb-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white/[0.03] px-3 py-1 text-xs font-mono uppercase tracking-wider text-cyan">
                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-cyan" />
                    Free · 60-second check
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                    See if AI can find your inventory
                  </h3>
                  <p className="mt-2 max-w-xl text-sm text-ink-muted">
                    We&apos;ll ask the major AI engines the questions your buyers
                    actually ask — and show you who they recommend instead of you.
                  </p>
                </div>
              )}

              <AuditInputs
                url={url}
                city={city}
                name={name}
                setUrl={setUrl}
                setCity={setCity}
                setName={setName}
                error={error}
                onSubmit={() => run({ url, city, dealershipName: name })}
              />
            </motion.div>
          )}

          {/* ------------------------------------------------- SCANNING */}
          {phase === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <ScanningView idx={scanIdx} city={city} url={url} />
            </motion.div>
          )}

          {/* --------------------------------------------------- RESULT */}
          {phase === "result" && report && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <ResultView
                report={report}
                unlocked={unlocked}
                gateEmail={gateEmail}
                gateName={gateName}
                gateBusy={gateBusy}
                gateError={gateError}
                setGateEmail={setGateEmail}
                setGateName={setGateName}
                submitGate={submitGate}
                onReset={reset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============================================================ Inputs */

function AuditInputs(props: {
  url: string;
  city: string;
  name: string;
  setUrl: (v: string) => void;
  setCity: (v: string) => void;
  setName: (v: string) => void;
  error: string | null;
  onSubmit: () => void;
}) {
  const { url, city, name, setUrl, setCity, setName, error, onSubmit } = props;
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_auto]">
        <Field
          label="Dealership website"
          placeholder="yourdealership.com"
          value={url}
          onChange={setUrl}
          onEnter={onSubmit}
          type="url"
          autoComplete="url"
        />
        <Field
          label="City / metro"
          placeholder="Austin, TX"
          value={city}
          onChange={setCity}
          onEnter={onSubmit}
        />
        <div className="flex items-end">
          <button
            onClick={onSubmit}
            className="h-[52px] w-full whitespace-nowrap rounded-xl bg-cyan px-6 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan/90 cta-glow sm:w-auto"
          >
            Run free check →
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <input
          aria-label="Dealership name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dealership name (optional)"
          className="flex-1 min-w-[200px] rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-cyan/50 focus:outline-none"
        />
        <p className="text-xs text-ink-faint">No credit card. No call required.</p>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}

function Field(props: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-faint">
        {props.label}
      </span>
      <input
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && props.onEnter?.()}
        placeholder={props.placeholder}
        className="h-[52px] w-full rounded-xl border border-line-strong bg-white/[0.03] px-4 text-sm text-ink placeholder:text-ink-faint focus:border-cyan/60 focus:bg-white/[0.05] focus:outline-none"
      />
    </label>
  );
}

/* ============================================================ Scanning */

function ScanningView({ idx, city, url }: { idx: number; city: string; url: string }) {
  return (
    <div>
      <div className="relative mb-6 overflow-hidden rounded-xl border border-line bg-black/30 p-5">
        <div className="scanline pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan/15 to-transparent" />
        <p className="font-mono text-xs text-ink-muted">
          <span className="text-cyan">scanning</span> {url || "your inventory"}
          {city ? ` · ${city}` : ""}
        </p>
        <p className="mt-3 text-lg font-medium text-ink">
          {SCAN_STEPS[idx] ?? SCAN_STEPS[SCAN_STEPS.length - 1]}
        </p>
      </div>

      <ul className="space-y-2">
        {SCAN_STEPS.map((step, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <li
              key={step}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-white/[0.04] text-ink" : "text-ink-faint",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px]",
                  done
                    ? "border-accent bg-accent/20 text-accent"
                    : active
                      ? "border-cyan text-cyan"
                      : "border-line text-ink-faint",
                )}
              >
                {done ? "✓" : active ? <span className="pulse-dot">●</span> : ""}
              </span>
              {step}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ============================================================ Result */

function ResultView(props: {
  report: AuditReport;
  unlocked: boolean;
  gateEmail: string;
  gateName: string;
  gateBusy: boolean;
  gateError: string | null;
  setGateEmail: (v: string) => void;
  setGateName: (v: string) => void;
  submitGate: () => void;
  onReset: () => void;
}) {
  const {
    report,
    unlocked,
    gateEmail,
    gateName,
    gateBusy,
    gateError,
    setGateEmail,
    setGateName,
    submitGate,
    onReset,
  } = props;

  const sample = report.engines[0];
  const gated = report.engines.slice(1);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          {report.mode === "demo" && (
            <span className="mb-2 inline-block rounded-full border border-warn/30 bg-warn/10 px-2.5 py-0.5 text-[11px] font-medium text-warn">
              Representative sample
            </span>
          )}
          <h3 className="text-xl font-semibold">
            AI-Visibility report
            {report.dealershipName ? ` · ${report.dealershipName}` : ""}
          </h3>
          <p className="text-sm text-ink-muted">
            {report.url} · {report.city}
          </p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          ↺ Run another
        </button>
      </div>

      {/* TEASER — always visible */}
      <div className="grid gap-6 rounded-xl border border-line bg-white/[0.02] p-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <ScoreRing score={report.score} band={report.scoreBand} />
        <div>
          <p className="text-sm text-ink-soft">
            Across {report.queryCount} buyer-style queries in {report.city}, your
            store appeared in{" "}
            <span className="font-semibold text-danger">
              {report.dealerHits} of {report.queryCount}
            </span>{" "}
            AI answers.
          </p>
          <div className="mt-4 rounded-lg border border-danger/25 bg-danger/[0.07] p-4">
            <p className="text-sm font-semibold text-ink">
              You stock ~{report.matchingCarsMissed} matching cars the AI never
              showed.
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Buyers asked. AI answered — with someone else&apos;s inventory.
            </p>
          </div>
        </div>
      </div>

      {/* One sample engine result — free */}
      <div className="mt-6">
        <p className="mb-2 text-xs uppercase tracking-wider text-ink-faint">
          Sample result · 1 of {report.queryCount}
        </p>
        <EngineRow result={sample} />
      </div>

      {/* GATE */}
      <div className="relative mt-6">
        {/* gated content, blurred until unlocked */}
        <div
          className={cn(
            "space-y-6 transition-all duration-500",
            !unlocked && "pointer-events-none select-none blur-[6px]",
          )}
          aria-hidden={!unlocked}
        >
          <div>
            <p className="mb-3 text-xs uppercase tracking-wider text-ink-faint">
              Full per-engine breakdown
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {gated.map((r) => (
                <EngineRow key={r.engine} result={r} />
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-line bg-white/[0.02] p-5">
              <p className="mb-4 text-sm font-semibold">AI Visibility Score breakdown</p>
              <PillarBars pillars={report.pillars} />
            </div>
            <div className="rounded-xl border border-line bg-white/[0.02] p-5">
              <p className="mb-4 text-sm font-semibold">Diagnosed gaps</p>
              <ul className="space-y-3">
                {report.gaps.map((g) => (
                  <li key={g} className="flex gap-2.5 text-sm text-ink-soft">
                    <span className="mt-1 text-danger">✕</span>
                    {g}
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-lg border border-accent/30 bg-accent/[0.08] p-4">
                <p className="text-sm font-semibold text-accent">The fix</p>
                <p className="mt-1 text-sm text-ink-soft">
                  LotPilot makes every car visible and works the leads. Just
                  connect your feed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* gate overlay */}
        {!unlocked && (
          <div className="absolute inset-0 grid place-items-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md rounded-2xl border border-line-strong bg-panel/95 p-6 shadow-2xl backdrop-blur"
            >
              <p className="text-center text-base font-semibold">
                Unlock your full report
              </p>
              <p className="mt-1 text-center text-sm text-ink-muted">
                See every engine result, your 5-pillar score breakdown, and the
                exact gaps to fix.
              </p>
              <div className="mt-4 space-y-3">
                <input
                  value={gateName}
                  onChange={(e) => setGateName(e.target.value)}
                  placeholder="Dealership name"
                  className="w-full rounded-xl border border-line-strong bg-white/[0.03] px-4 py-3 text-sm focus:border-cyan/60 focus:outline-none"
                />
                <input
                  value={gateEmail}
                  onChange={(e) => setGateEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitGate()}
                  type="email"
                  placeholder="Work email"
                  className="w-full rounded-xl border border-line-strong bg-white/[0.03] px-4 py-3 text-sm focus:border-cyan/60 focus:outline-none"
                />
                {gateError && <p className="text-sm text-danger">{gateError}</p>}
                <button
                  onClick={submitGate}
                  disabled={gateBusy}
                  className="w-full rounded-xl bg-cyan px-6 py-3 text-sm font-semibold text-ink-inverse transition-all hover:bg-cyan/90 cta-glow disabled:opacity-60"
                >
                  {gateBusy ? "Unlocking…" : "Show me the full report →"}
                </button>
                <p className="text-center text-[11px] text-ink-faint">
                  We never resell your data. Unsubscribe anytime.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {unlocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-cyan/30 bg-cyan/[0.06] p-6 text-center"
        >
          <p className="text-lg font-semibold">
            Want these cars showing up in AI answers instead?
          </p>
          <p className="max-w-md text-sm text-ink-muted">
            Connect your existing inventory feed and LotPilot handles discovery
            and lead-working. You don&apos;t change a thing in your store.
          </p>
          <a
            href="#feed"
            className="mt-1 inline-flex h-12 items-center rounded-full bg-cyan px-7 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan/90 cta-glow"
          >
            Connect your feed →
          </a>
        </motion.div>
      )}
    </div>
  );
}
