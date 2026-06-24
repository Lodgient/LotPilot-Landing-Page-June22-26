"use client";

import type { EngineQueryResult } from "@/lib/audit/types";
import { cn } from "@/lib/cn";

const ENGINE_GLYPH: Record<string, string> = {
  ChatGPT: "◎",
  Perplexity: "✷",
  Gemini: "✦",
  Grok: "✸",
  Claude: "✶",
  "Google AI Overviews": "◆",
  "Bing Copilot": "❖",
};

export default function EngineRow({ result }: { result: EngineQueryResult }) {
  return (
    <div className="rounded-xl border border-line bg-black/[0.02] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-black/[0.06] text-sm text-cyan">
            {ENGINE_GLYPH[result.engine] ?? "•"}
          </span>
          <span className="text-sm font-semibold">{result.engine}</span>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-medium",
            result.dealerPresent
              ? "bg-accent/15 text-accent"
              : "bg-danger/15 text-danger",
          )}
        >
          {result.dealerPresent ? "You appeared" : "You were absent"}
        </span>
      </div>

      <p className="mt-3 font-mono text-xs text-ink-muted">
        <span className="text-ink-faint">query › </span>
        &ldquo;{result.query}&rdquo;
      </p>

      <div className="mt-3">
        <p className="mb-1.5 text-[11px] uppercase tracking-wider text-ink-faint">
          AI recommended
        </p>
        <div className="flex flex-wrap gap-1.5">
          {result.recommended.map((s, i) => (
            <span
              key={`${s.name}-${i}`}
              className={cn(
                "rounded-md border px-2 py-1 text-xs",
                s.type === "dealer"
                  ? "border-accent/40 bg-accent/15 font-medium text-accent"
                  : s.type === "competitor"
                    ? "border-danger/30 bg-danger/10 text-danger"
                    : "border-line-strong bg-black/[0.04] text-ink-soft",
              )}
            >
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
