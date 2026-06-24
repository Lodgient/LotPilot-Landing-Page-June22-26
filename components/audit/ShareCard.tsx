"use client";

import { forwardRef, useCallback, useRef, useState } from "react";
import { toPng } from "html-to-image";
import Icon from "@/components/Icon";

export interface ShockProof {
  engine: string;
  query: string;
  /** What the AI named instead of the dealer (marketplaces / competitor). */
  names: string[];
}

export interface ShareCardData {
  dealershipName: string;
  city: string;
  score: number;
  dealerHits: number;
  queryCount: number;
  shock: ShockProof;
}

/**
 * The forwardable "shock" asset (product doc §4.3): a clean, branded card that
 * shows a real AI answer naming a competitor/marketplace — not the dealer.
 * Fixed width + explicit hex colors so html-to-image exports it faithfully.
 */
export const ShareCard = forwardRef<HTMLDivElement, { data: ShareCardData }>(
  function ShareCard({ data }, ref) {
    const { dealershipName, city, score, dealerHits, queryCount, shock } = data;
    const named = shock.names.slice(0, 2);
    return (
      <div
        ref={ref}
        style={{ width: 520, fontFamily: "var(--font-geist-sans, Inter, sans-serif)" }}
        className="overflow-hidden rounded-2xl bg-[#0a0f1a] p-7 text-[#f8fafc]"
      >
        {/* brand row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#0ea5e9]">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
                <path
                  d="M11.6 2.3 21 21.2c.3.6-.3 1.3-.9 1l-7.7-3.4a1 1 0 0 0-.8 0L3.9 22.2c-.6.3-1.2-.4-.9-1L10.4 2.3a.65.65 0 0 1 1.2 0Z"
                  fill="#ffffff"
                />
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.01em]">LotPilot</span>
          </div>
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8fb6ff]">
            AI-Visibility Check
          </span>
        </div>

        {/* the buyer's question */}
        <p className="mt-6 text-[13px] text-[#9fb0c7]">
          A buyer{city ? ` in ${city}` : ""} asked {shock.engine}:
        </p>
        <p className="mt-2 text-[19px] font-semibold leading-snug text-[#f8fafc]">
          &ldquo;{shock.query}&rdquo;
        </p>

        {/* the AI's answer — named someone else */}
        <div className="mt-4 rounded-xl border border-[#1e2a3d] bg-[#0e1626] p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9fb0c7]">
            {shock.engine} recommended
          </p>
          {named.map((n) => (
            <p key={n} className="mt-2 flex items-center gap-2 text-[15px] font-medium text-[#f8fafc]">
              <span className="text-[#22d3ee]">→</span>
              {n}
            </p>
          ))}
          <div className="mt-3 flex items-center gap-2 border-t border-[#1e2a3d] pt-3">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#3a1518] text-[12px] text-[#ff6b6b]">
              ✕
            </span>
            <p className="text-[14px] text-[#ff8585]">
              <span className="font-semibold">{dealershipName || "Your store"}</span> — not mentioned
            </p>
          </div>
        </div>

        {/* the damning stat */}
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-[40px] font-bold leading-none tracking-[-0.02em]">
              {dealerHits}
              <span className="text-[#62748e]">/{queryCount}</span>
            </p>
            <p className="mt-1.5 max-w-[260px] text-[13px] leading-snug text-[#9fb0c7]">
              AI answers actually named {dealershipName || "this store"}. The rest went to rivals.
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-[34px] font-bold leading-none"
              style={{ color: score >= 70 ? "#34d399" : score >= 40 ? "#fbbf24" : "#ff6b6b" }}
            >
              {score}
              <span className="text-[16px] text-[#62748e]">/100</span>
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-[#62748e]">AI score</p>
          </div>
        </div>

        {/* footer */}
        <div className="mt-6 flex items-center justify-between border-t border-[#1e2a3d] pt-4">
          <p className="text-[12px] text-[#9fb0c7]">
            Buyers stopped Googling. They ask AI which car to buy.
          </p>
          <p className="text-[12px] font-semibold text-[#8fb6ff]">lotpilot.com</p>
        </div>
      </div>
    );
  },
);

/**
 * Renders the ShareCard plus Download / Share actions. Captures the card node
 * to a PNG via html-to-image; uses the Web Share API on mobile, download elsewhere.
 */
export function ShareProof({
  data,
  onAuditRival,
}: {
  data: ShareCardData;
  onAuditRival?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const fileName = `lotpilot-ai-check-${(data.dealershipName || "your-store")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}.png`;

  const capture = useCallback(async () => {
    if (!cardRef.current) return null;
    return toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#0a0f1a",
    });
  }, []);

  const onDownload = useCallback(async () => {
    setBusy(true);
    setDone(null);
    try {
      const dataUrl = await capture();
      if (!dataUrl) return;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = fileName;
      a.click();
      setDone("Saved");
    } catch {
      setDone("Couldn't export — try a screenshot");
    } finally {
      setBusy(false);
    }
  }, [capture, fileName]);

  const onShare = useCallback(async () => {
    setBusy(true);
    setDone(null);
    try {
      const dataUrl = await capture();
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], fileName, { type: "image/png" });
      const nav = navigator as Navigator & {
        canShare?: (d: ShareData) => boolean;
      };
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({
          files: [file],
          title: "AI-Visibility Check",
          text: "AI isn't recommending this store. See yours free at lotpilot.com",
        });
        setDone("Shared");
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = fileName;
        a.click();
        setDone("Saved");
      }
    } catch {
      /* user cancelled share — no-op */
    } finally {
      setBusy(false);
    }
  }, [capture, fileName]);

  return (
    <div className="mt-6">
      <p className="mb-3 text-xs uppercase tracking-wider text-ink-faint">
        The proof — forward this to anyone who doubts it
      </p>
      <div className="overflow-x-auto">
        <ShareCard ref={cardRef} data={data} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <button
          onClick={onShare}
          disabled={busy}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          <Icon name="arrow-right" size={15} />
          {busy ? "Preparing…" : "Share this image"}
        </button>
        <button
          onClick={onDownload}
          disabled={busy}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-strong bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-cyan/50 disabled:opacity-50"
        >
          Download PNG
        </button>
        {onAuditRival && (
          <button
            onClick={onAuditRival}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-strong bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-cyan/50"
          >
            🔍 Audit a competitor
          </button>
        )}
        {done && <span className="text-xs text-ink-muted">{done}</span>}
      </div>
    </div>
  );
}
