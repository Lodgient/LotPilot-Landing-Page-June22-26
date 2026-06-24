"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { generateReport } from "@/lib/audit/generateReport";
import type { AuditReport } from "@/lib/audit/types";
import Icon from "@/components/Icon";
import ScoreRing from "./ScoreRing";
import PillarBars from "./PillarBars";
import EngineRow from "./EngineRow";
import { cn } from "@/lib/cn";

/** Cross-section trigger: the hero/CTA can dispatch this to auto-run the agent. */
export const RUN_AUDIT_EVENT = "lotpilot:run-audit";
export interface RunAuditDetail {
  url: string;
  city: string;
  dealershipName?: string;
}

const SCAN_STEPS = [
  "Crawling your vehicle pages as an AI bot…",
  "Querying ChatGPT…",
  "Querying Perplexity…",
  "Querying Gemini…",
  "Querying Grok…",
  "Querying Claude…",
  "Querying Google AI Overviews…",
  "Querying Bing Copilot…",
  "Scoring crawlability, schema, freshness & citations…",
];

const PROMPTS = [
  "smithtoyota.com — Austin, TX",
  "Why don't I show up in ChatGPT?",
  "What is an AI Visibility Score?",
];

type Msg =
  | { id: number; role: "assistant" | "user"; kind: "text"; text: string }
  | { id: number; role: "assistant"; kind: "scan"; step: number; url: string; city: string }
  | { id: number; role: "assistant"; kind: "report"; report: AuditReport };

let _id = 0;
const nid = () => ++_id;

/** Pull a domain (and any leftover text as the city) out of a free-text message. */
function parseInput(raw: string): { url: string; city: string } | null {
  const m = raw.match(
    /\b((?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+)\b/i,
  );
  if (!m || !m[1]) return null;
  // Ignore matches that are just a sentence with a period — require a known-ish TLD shape.
  if (!/\.(com|net|org|io|co|us|dealer|auto|cars?|biz|info|app|store)\b/i.test(m[1]))
    return null;
  const url = m[1];
  const idx = m.index ?? 0;
  const city = (raw.slice(0, idx) + " " + raw.slice(idx + url.length))
    .replace(/\b(in|for|my|the|store|dealership|website|site|is|at|near|me)\b/gi, " ")
    .replace(/[—–"',.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { url, city };
}

export default function AuditTool() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: nid(),
      role: "assistant",
      kind: "text",
      text:
        "Hey — I'm the LotPilot visibility agent. Paste your dealership website below (add your city for sharper results) and I'll check how often AI engines like ChatGPT, Perplexity and Google AI Overviews recommend your store when local buyers ask which car to buy.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const push = (m: Msg) => setMessages((x) => [...x, m]);
  const scrollToMsg = (id: number, block: ScrollLogicalPosition = "start") => {
    timers.current.push(
      setTimeout(() => {
        document.getElementById(`am-${id}`)?.scrollIntoView({ behavior: "smooth", block });
      }, 80),
    );
  };

  const runAudit = useCallback(
    (url: string, city: string, dealershipName?: string) => {
      setBusy(true);
      const scanId = nid();
      push({ id: scanId, role: "assistant", kind: "scan", step: 0, url, city });

      timers.current.forEach(clearTimeout);
      timers.current = [];
      SCAN_STEPS.forEach((_, i) => {
        timers.current.push(
          setTimeout(() => {
            setMessages((x) =>
              x.map((m) =>
                m.id === scanId && m.kind === "scan" ? { ...m, step: i } : m,
              ),
            );
          }, i * 480),
        );
      });

      const report = generateReport(url, city, dealershipName);
      const total = SCAN_STEPS.length * 480 + 420;
      timers.current.push(
        setTimeout(() => {
          setMessages((x) => x.filter((m) => m.id !== scanId));
          const reportId = nid();
          push({ id: reportId, role: "assistant", kind: "report", report });
          push({
            id: nid(),
            role: "assistant",
            kind: "text",
            text: `You showed up in just ${report.dealerHits} of ${report.queryCount} buyer questions${
              city ? ` around ${city}` : ""
            } — and there are ~${report.matchingCarsMissed} matching cars on your lot the AI never mentioned. Every gap here is fixable from the inventory feed you already export. Want me to show you how LotPilot turns this around?`,
          });
          scrollToMsg(reportId, "start");
          setBusy(false);
        }, total),
      );
    },
    [],
  );

  const streamAnswer = useCallback(async (history: Msg[]) => {
    setBusy(true);
    const id = nid();
    push({ id, role: "assistant", kind: "text", text: "" });
    try {
      const payload = history
        .filter((m): m is Extract<Msg, { kind: "text" }> => m.kind === "text")
        .map((m) => ({ role: m.role, content: m.text }));
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      if (!res.ok || !res.body) throw new Error("unreachable");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((x) =>
          x.map((m) => (m.id === id && m.kind === "text" ? { ...m, text: acc } : m)),
        );
      }
    } catch {
      setMessages((x) =>
        x.map((m) =>
          m.id === id && m.kind === "text"
            ? {
                ...m,
                text: "Paste your dealership website (like yourstore.com) and I'll run the full visibility check right here — free, no signup.",
              }
            : m,
        ),
      );
    } finally {
      setBusy(false);
    }
  }, []);

  const submit = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;
      setInput("");
      const userMsg: Msg = { id: nid(), role: "user", kind: "text", text };
      setMessages((x) => [...x, userMsg]);
      scrollToMsg(userMsg.id, "start");

      const parsed = parseInput(text);
      if (parsed) runAudit(parsed.url, parsed.city);
      else streamAnswer([...messages, userMsg]);
    },
    [busy, messages, runAudit, streamAnswer],
  );

  // Allow the hero / other CTAs to launch a run.
  useEffect(() => {
    function onRun(e: Event) {
      const d = (e as CustomEvent<RunAuditDetail>).detail;
      if (!d?.url) return;
      push({
        id: nid(),
        role: "user",
        kind: "text",
        text: `${d.url}${d.city ? ` — ${d.city}` : ""}`,
      });
      runAudit(d.url, d.city, d.dealershipName);
    }
    window.addEventListener(RUN_AUDIT_EVENT, onRun as EventListener);
    return () => window.removeEventListener(RUN_AUDIT_EVENT, onRun as EventListener);
  }, [runAudit]);

  return (
    <div className="surface relative overflow-hidden rounded-2xl">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />

      {/* header */}
      <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan/12 text-cyan ring-1 ring-inset ring-cyan/25">
          <Icon name="sparkles" size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">LotPilot Visibility Agent</p>
          <p className="flex items-center gap-1.5 text-[11px] text-ink-faint">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
            Online · free 60-second check
          </p>
        </div>
      </div>

      {/* conversation — grows with content; the page scrolls, not an inner box */}
      <div className="space-y-4 px-4 py-5 sm:px-5">
        {messages.map((m) => (
          <div key={m.id} id={`am-${m.id}`} className="scroll-mt-24">
            <MessageView m={m} />
          </div>
        ))}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pl-11">
            {PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => submit(p)}
                className="rounded-full border border-line-strong bg-black/[0.02] px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-cyan/40 hover:text-ink"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="border-t border-line bg-black/[0.015] p-3"
      >
        <div className="flex items-end gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your dealership website…  e.g. yourstore.com — Austin, TX"
            className="h-12 flex-1 rounded-xl border border-line-strong bg-canvas px-4 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-cyan/60"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow disabled:translate-y-0 disabled:opacity-50"
          >
            <Icon name="arrow-right" size={20} strokeWidth={2.25} />
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[10px] text-ink-faint">
          Free · no signup · representative sample for un-optimized stores. Connect your feed for a live report.
        </p>
      </form>
    </div>
  );
}

/* ============================================================ message views */

function Avatar() {
  return (
    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan/12 text-cyan ring-1 ring-inset ring-cyan/20">
      <Icon name="sparkles" size={16} />
    </span>
  );
}

function MessageView({ m }: { m: Msg }) {
  if (m.kind === "text" && m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-cyan px-3.5 py-2.5 text-sm text-ink-inverse shadow-sm">
          {m.text}
        </div>
      </div>
    );
  }

  if (m.kind === "text") {
    return (
      <div className="flex items-start gap-2.5">
        <Avatar />
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-line bg-black/[0.02] px-3.5 py-2.5 text-sm leading-relaxed text-ink-soft">
          {m.text || <Dots />}
        </div>
      </div>
    );
  }

  if (m.kind === "scan") {
    return (
      <div className="flex items-start gap-2.5">
        <Avatar />
        <div className="w-full max-w-[85%]">
          <ScanCard step={m.step} url={m.url} city={m.city} />
        </div>
      </div>
    );
  }

  // report
  return (
    <div className="flex items-start gap-2.5">
      <Avatar />
      <div className="w-full">
        <ReportCard report={m.report} />
      </div>
    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="pulse-dot h-1.5 w-1.5 rounded-full bg-ink-faint"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

/* ============================================================ scan card */

function ScanCard({ step, url, city }: { step: number; url: string; city: string }) {
  return (
    <div className="overflow-hidden rounded-2xl rounded-tl-sm border border-line bg-canvas-2/70 p-4">
      <p className="font-mono text-xs text-ink-muted">
        <span className="text-cyan">scanning</span> {url}
        {city ? ` · ${city}` : ""}
      </p>
      <p className="mt-2 text-sm font-medium text-ink">
        {SCAN_STEPS[step] ?? SCAN_STEPS[SCAN_STEPS.length - 1]}
      </p>
      <ul className="mt-3 space-y-1.5">
        {SCAN_STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li
              key={s}
              className={cn(
                "flex items-center gap-2.5 text-xs transition-colors",
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
  );
}

/* ============================================================ report card */

function ReportCard({ report }: { report: AuditReport }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-2xl rounded-tl-sm border border-line-strong bg-panel p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          {report.mode === "demo" && (
            <span className="mb-2 inline-block rounded-full border border-warn/30 bg-warn/10 px-2.5 py-0.5 text-[11px] font-medium text-warn">
              Representative sample
            </span>
          )}
          <h3 className="text-lg font-semibold text-ink">
            AI-Visibility report
            {report.dealershipName ? ` · ${report.dealershipName}` : ""}
          </h3>
          <p className="text-sm text-ink-muted">
            {report.url}
            {report.city ? ` · ${report.city}` : ""}
          </p>
        </div>
      </div>

      {/* score + headline finding */}
      <div className="grid gap-6 rounded-xl border border-line bg-black/[0.02] p-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <ScoreRing score={report.score} band={report.scoreBand} size={150} />
        <div>
          <p className="text-sm text-ink-soft">
            Across {report.queryCount} buyer-style queries
            {report.city ? ` in ${report.city}` : ""}, your store appeared in{" "}
            <span className="font-semibold text-danger">
              {report.dealerHits} of {report.queryCount}
            </span>{" "}
            AI answers.
          </p>
          <div className="mt-4 rounded-lg border border-danger/25 bg-danger/[0.07] p-4">
            <p className="text-sm font-semibold text-ink">
              ~{report.matchingCarsMissed} matching cars in stock the AI never showed.
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Buyers asked. AI answered — with someone else&apos;s inventory.
            </p>
          </div>
        </div>
      </div>

      {/* per-engine results */}
      <p className="mb-3 mt-6 text-xs uppercase tracking-wider text-ink-faint">
        What the AI engines recommended
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {report.engines.map((r) => (
          <EngineRow key={r.engine} result={r} />
        ))}
      </div>

      {/* pillar breakdown + gaps */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-black/[0.02] p-5">
          <p className="mb-4 text-sm font-semibold text-ink">
            AI Visibility Score breakdown
          </p>
          <PillarBars pillars={report.pillars} />
        </div>
        <div className="rounded-xl border border-line bg-black/[0.02] p-5">
          <p className="mb-4 text-sm font-semibold text-ink">Diagnosed gaps</p>
          <ul className="space-y-3">
            {report.gaps.map((g) => (
              <li key={g} className="flex gap-2.5 text-sm text-ink-soft">
                <span className="mt-0.5 text-danger">✕</span>
                {g}
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-lg border border-accent/30 bg-accent/[0.08] p-4">
            <p className="text-sm font-semibold text-accent">The fix</p>
            <p className="mt-1 text-sm text-ink-soft">
              LotPilot makes every car visible and works the leads. You just
              connect the feed you already export.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href="#feed"
          className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-cyan px-7 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow"
        >
          Connect your feed
          <Icon name="arrow-right" size={16} />
        </a>
        <a
          href="#demo"
          className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-line-strong bg-white px-7 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-cyan/50"
        >
          Book a demo
        </a>
      </div>
    </motion.div>
  );
}
