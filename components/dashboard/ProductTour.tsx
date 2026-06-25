"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

export const START_TOUR = "lotpilot:start-tour";

type Step = { sel: string; title: string; body: string; place?: "top" | "bottom" };

const STEPS: Step[] = [
  {
    sel: '[data-tour="gross"]',
    title: "What your AI did overnight",
    body: "Every morning you see the gross your AI influenced while the store was closed — leads answered, appointments booked, credit apps captured.",
    place: "bottom",
  },
  {
    sel: '[data-tour="kpis"]',
    title: "The numbers that matter",
    body: "Speed-to-lead, appointments, credit apps — tracked against the prior period so you always know the trend.",
    place: "top",
  },
  {
    sel: '[data-tour="nav-visibility"]',
    title: "Get found by AI",
    body: "AI Visibility shows what % of your inventory is the cited answer in ChatGPT, Perplexity, Gemini, Grok and Claude — and who's winning instead.",
    place: "bottom",
  },
  {
    sel: '[data-tour="bell"]',
    title: "Never miss a thing",
    body: "Hot-lead alerts, visibility movement and the daily recap — surfaced here in real time.",
    place: "bottom",
  },
  {
    sel: '[data-tour="start"]',
    title: "Make it yours",
    body: "This is real, live software on demo data. Connect the feed you already export and your own dashboard lights up in about a minute.",
    place: "bottom",
  },
];

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function ProductTour() {
  const [active, setActive] = useState(false);
  const [i, setI] = useState(0);
  const [box, setBox] = useState<Box | null>(null);

  const measure = useCallback(() => {
    const el = document.querySelector(STEPS[i]?.sel);
    if (!el) {
      setBox(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [i]);

  // start on event
  useEffect(() => {
    const onStart = () => {
      setI(0);
      setActive(true);
    };
    window.addEventListener(START_TOUR, onStart);
    return () => window.removeEventListener(START_TOUR, onStart);
  }, []);

  // scroll target into view, then measure
  useEffect(() => {
    if (!active) return;
    const el = document.querySelector(STEPS[i]?.sel);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(measure, 360);
    return () => clearTimeout(t);
  }, [active, i, measure]);

  useLayoutEffect(() => {
    if (!active) return;
    const on = () => measure();
    window.addEventListener("resize", on);
    window.addEventListener("scroll", on, true);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("scroll", on, true);
    };
  }, [active, measure]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(false);
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function next() {
    setI((v) => {
      if (v >= STEPS.length - 1) {
        setActive(false);
        return v;
      }
      return v + 1;
    });
  }

  if (!active) return null;
  const step = STEPS[i];
  const pad = 8;

  // tooltip placement
  const below = !box || step.place !== "top";
  const tipTop = box
    ? below
      ? box.top + box.height + pad + 10
      : box.top - pad - 10
    : window.innerHeight / 2;
  const tipLeft = box ? Math.min(Math.max(box.left + box.width / 2, 180), window.innerWidth - 180) : window.innerWidth / 2;

  return (
    <div className="fixed inset-0 z-[120]">
      {/* dim + spotlight cutout */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={
          box
            ? {
                top: box.top - pad,
                left: box.left - pad,
                width: box.width + pad * 2,
                height: box.height + pad * 2,
                borderRadius: 16,
                boxShadow: "0 0 0 9999px rgba(20,23,32,0.62)",
              }
            : { boxShadow: "0 0 0 9999px rgba(20,23,32,0.62)", inset: "50% 50%" as unknown as number }
        }
        onClick={() => setActive(false)}
      />
      {box && (
        <div
          className="pointer-events-none absolute rounded-2xl ring-2 ring-cyan transition-all duration-300"
          style={{ top: box.top - pad, left: box.left - pad, width: box.width + pad * 2, height: box.height + pad * 2 }}
        />
      )}

      {/* tooltip */}
      <div
        className="absolute w-[300px] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border border-line bg-panel p-4 shadow-[0_30px_80px_-24px_rgba(20,23,32,0.6)]"
        style={{ top: tipTop, left: tipLeft, transform: `translateX(-50%) ${below ? "" : "translateY(-100%)"}` }}
      >
        <p className="font-display text-base text-ink">{step.title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.body}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex gap-1">
            {STEPS.map((_, n) => (
              <span
                key={n}
                className={`h-1.5 rounded-full transition-all ${n === i ? "w-4 bg-cyan" : "w-1.5 bg-black/15"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActive(false)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-muted hover:text-ink"
            >
              Skip
            </button>
            {i === STEPS.length - 1 ? (
              <Link
                href="/signup?plan=visibility"
                className="inline-flex items-center gap-1 rounded-full bg-cyan px-3.5 py-1.5 text-xs font-semibold text-ink-inverse hover:bg-cyan-dim"
              >
                Start your own <Icon name="arrow-right" size={13} />
              </Link>
            ) : (
              <button
                onClick={next}
                className="inline-flex items-center gap-1 rounded-full bg-cyan px-3.5 py-1.5 text-xs font-semibold text-ink-inverse hover:bg-cyan-dim"
              >
                Next <Icon name="arrow-right" size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
