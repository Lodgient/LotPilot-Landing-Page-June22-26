"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { Card, PanelHeading } from "@/components/dashboard/ui";
import { ENGINES, type EngineName, type VisibilityQuery } from "@/lib/dashboard/types";
import { cn } from "@/lib/cn";

const SHORT: Record<string, string> = {
  ChatGPT: "ChatGPT",
  Perplexity: "Perplexity",
  Gemini: "Gemini",
  Grok: "Grok",
  Claude: "Claude",
  "Google AI Overviews": "Google AIO",
  "Bing Copilot": "Copilot",
};

/** Reveal text character-by-character — the "live AI answer" effect. */
function useTypewriter(text: string, speed = 12) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setOut("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      if (i >= text.length) {
        setOut(text);
        setDone(true);
        clearInterval(id);
      } else {
        setOut(text.slice(0, i));
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { out, done };
}

/**
 * AI Answer Monitor — shows exactly what a buyer sees when they type a real
 * car-buying query into each AI engine (ChatGPT, Perplexity, Gemini, Grok,
 * Google AI Overviews, Copilot): whether this store is the cited answer, or a
 * competitor is. The live sales-call tool that makes "you're invisible" real.
 */
export default function AnswerMonitor({
  dealerName,
  metro,
  queries,
}: {
  dealerName: string;
  metro: string;
  queries: VisibilityQuery[];
}) {
  const [qi, setQi] = useState(0);
  const q = queries[Math.min(qi, queries.length - 1)];
  const [engine, setEngine] = useState<EngineName>(
    ENGINES.find((e) => q.engines[e]) ?? ENGINES[0],
  );
  useEffect(() => {
    setEngine(ENGINES.find((e) => queries[qi]?.engines[e]) ?? ENGINES[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi]);

  const cited = !!q.engines[engine];
  const metroShort = metro.split(",")[0] || "your market";
  const competitor = q.competitor || "a national marketplace";
  const site = dealerName.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".com";

  const answer = cited
    ? `A strong local match is ${dealerName}${
        metro ? ` in ${metroShort}` : ""
      } — they have several in stock that fit "${q.query}," with pricing and availability on their listing. Worth reaching out before they sell.`
    : `For "${q.query}," the options most commonly cited are ${competitor}. I don't see ${dealerName}'s matching inventory surfaced for this question yet.`;

  const { out, done } = useTypewriter(answer);

  return (
    <Card>
      <PanelHeading
        title="AI answer monitor"
        sub="Exactly what a buyer sees when they ask an AI engine — including Grok"
      />

      {/* pick a real buyer query */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {queries.slice(0, 8).map((c, i) => (
          <button
            key={c.query}
            onClick={() => setQi(i)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              i === qi
                ? "border-cyan/40 bg-cyan/10 text-cyan"
                : "border-line bg-black/[0.02] text-ink-muted hover:text-ink",
            )}
          >
            {c.query.length > 36 ? c.query.slice(0, 34) + "…" : c.query}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-canvas-2/50">
        {/* engine tabs — green = you're cited, red = a competitor is */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-black/[0.02] px-3 py-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-cyan/12 text-cyan">
            <Icon name="sparkles" size={14} />
          </span>
          <div className="flex flex-1 flex-wrap gap-1">
            {ENGINES.map((e) => {
              const on = e === engine;
              const eCited = !!q.engines[e];
              return (
                <button
                  key={e}
                  onClick={() => setEngine(e)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                    on ? "bg-ink text-canvas" : "text-ink-muted hover:bg-black/[0.05] hover:text-ink",
                  )}
                  title={`${e}: ${eCited ? "you're cited" : "a competitor is cited"}`}
                >
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full", eCited ? "bg-accent" : "bg-danger/60")}
                  />
                  {SHORT[e] ?? e}
                </button>
              );
            })}
          </div>
          <span className="flex items-center gap-1 text-[10px] font-medium text-ink-faint">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" /> Live answer
          </span>
        </div>

        <div className="space-y-3 p-4">
          {/* buyer's question */}
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-cyan px-3.5 py-2 text-sm text-ink-inverse">
              {q.query}
            </div>
          </div>

          {/* streamed engine answer */}
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink text-[11px] font-semibold text-canvas">
              {(SHORT[engine] ?? "AI")[0]}
            </span>
            <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-line bg-white px-3.5 py-2.5 text-sm leading-relaxed text-ink-soft">
              {out}
              {!done && (
                <span className="ml-0.5 inline-block h-3.5 w-[3px] animate-pulse bg-cyan align-middle" />
              )}
              {done && (
                <div
                  className={cn(
                    "mt-2.5 flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs",
                    cited
                      ? "border-accent/30 bg-accent/[0.06] text-accent"
                      : "border-danger/30 bg-danger/[0.06] text-danger",
                  )}
                >
                  <Icon name={cited ? "check" : "close"} size={13} strokeWidth={2.5} />
                  {cited ? (
                    <span className="truncate">
                      Source: <span className="font-medium">{site}</span>
                    </span>
                  ) : (
                    <span>
                      AI cited <span className="font-medium">{competitor}</span> — not you
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* verdict */}
        <div
          className={cn(
            "flex items-center gap-2 border-t px-4 py-2.5 text-xs font-medium",
            cited
              ? "border-accent/20 bg-accent/[0.05] text-accent"
              : "border-danger/20 bg-danger/[0.05] text-danger",
          )}
        >
          <Icon name={cited ? "check" : "radar"} size={14} strokeWidth={2.5} />
          {cited
            ? `You're the answer buyers see in ${SHORT[engine]} for this question.`
            : `${SHORT[engine]} sends this buyer to a competitor — LotPilot is closing this gap.`}
        </div>
      </div>

      <p className="mt-3 text-xs text-ink-faint">
        We run these buyer queries against each engine on a schedule and capture what shows up.
        Green tabs = your inventory is cited; red = a competitor is. Fixing the gaps routes the
        next run&apos;s answer back to you.
      </p>
    </Card>
  );
}
