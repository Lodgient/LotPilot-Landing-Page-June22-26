"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";

export const START_TOUR = "lotpilot:start-tour";
const KEY = "lp-tour";

type Step = { path?: string; sel: string; title: string; body: string; place?: "top" | "bottom" };

const STEPS: Step[] = [
  {
    path: "/dashboard",
    sel: '[data-tour="gross"]',
    title: "What your AI did overnight",
    body: "Every morning: the gross your AI influenced while the store was closed — leads answered, appointments booked, credit apps captured.",
    place: "bottom",
  },
  {
    path: "/dashboard",
    sel: '[data-tour="kpis"]',
    title: "The numbers that matter",
    body: "Speed-to-lead, appointments, credit apps — tracked against the prior period so you always know the trend.",
    place: "top",
  },
  {
    path: "/dashboard/visibility",
    sel: '[data-tour="citation"]',
    title: "Are you the answer AI gives?",
    body: "Your Inventory Citation Rate — the share of your live inventory that's the cited answer in ChatGPT, Perplexity, Gemini, Grok and Claude.",
    place: "bottom",
  },
  {
    path: "/dashboard/visibility",
    sel: '[data-tour="shock"]',
    title: "See who AI names instead",
    body: "When a buyer asks AI and it recommends a rival, we capture it — and hand you a shareable image of the exact moment.",
    place: "top",
  },
  {
    path: "/dashboard/leads",
    sel: '[data-tour="inbox"]',
    title: "Every lead, worked in seconds",
    body: "Your AI agent replies, qualifies, books and captures credit apps 24/7 — you take over any conversation with one tap.",
    place: "bottom",
  },
  {
    path: "/dashboard/roi",
    sel: '[data-tour="roi"]',
    title: "Proof your GM signs renewals on",
    body: "Every sold car and dollar of gross traced to the AI engine that produced it — the board-ready bottom line.",
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
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [i, setI] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const retry = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setActive(false);
    setBox(null);
  }, []);

  // resume an in-progress tour after a page navigation
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(KEY);
    } catch {
      /* ignore */
    }
    if (saved !== null) {
      setI(Number(saved) || 0);
      setActive(true);
    }
    const onStart = () => {
      try {
        sessionStorage.setItem(KEY, "0");
      } catch {
        /* ignore */
      }
      setI(0);
      setActive(true);
    };
    window.addEventListener(START_TOUR, onStart);
    return () => window.removeEventListener(START_TOUR, onStart);
  }, []);

  // locate the step's target (poll — it may not be mounted right after nav)
  useEffect(() => {
    if (!active) return;
    const step = STEPS[i];
    if (step.path && step.path !== pathname) return; // wait until we're on the right page
    let tries = 0;
    const find = () => {
      const el = document.querySelector(step.sel);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          const r = el.getBoundingClientRect();
          setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
        }, 320);
        return;
      }
      if (tries++ < 24) retry.current = setTimeout(find, 150);
      else setBox(null); // give up → center the tooltip
    };
    find();
    return () => {
      if (retry.current) clearTimeout(retry.current);
    };
  }, [active, i, pathname]);

  // keep the spotlight glued to the target on scroll/resize
  useEffect(() => {
    if (!active) return;
    const on = () => {
      const el = document.querySelector(STEPS[i]?.sel);
      if (el) {
        const r = el.getBoundingClientRect();
        setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
    };
    window.addEventListener("resize", on);
    window.addEventListener("scroll", on, true);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("scroll", on, true);
    };
  }, [active, i]);

  const go = useCallback(
    (ni: number) => {
      if (ni >= STEPS.length) {
        stop();
        return;
      }
      try {
        sessionStorage.setItem(KEY, String(ni));
      } catch {
        /* ignore */
      }
      setBox(null);
      setI(ni);
      const dest = STEPS[ni].path;
      if (dest && dest !== pathname) router.push(dest);
    },
    [pathname, router, stop],
  );

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stop();
      else if (e.key === "ArrowRight") go(i + 1);
      else if (e.key === "ArrowLeft") go(Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, i, go, stop]);

  if (!active) return null;
  const step = STEPS[i];
  const pad = 8;
  const below = !box || step.place !== "top";
  const tipTop = box
    ? below
      ? box.top + box.height + pad + 10
      : box.top - pad - 10
    : (typeof window !== "undefined" ? window.innerHeight : 800) / 2;
  const tipLeft = box
    ? Math.min(
        Math.max(box.left + box.width / 2, 180),
        (typeof window !== "undefined" ? window.innerWidth : 1200) - 180,
      )
    : (typeof window !== "undefined" ? window.innerWidth : 1200) / 2;

  return (
    <div className="fixed inset-0 z-[120]">
      <div
        className="absolute transition-all duration-300"
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
            : { inset: 0, boxShadow: "inset 0 0 0 9999px rgba(20,23,32,0.62)" }
        }
        onClick={stop}
      />
      {box && (
        <div
          className="pointer-events-none absolute rounded-2xl ring-2 ring-cyan transition-all duration-300"
          style={{ top: box.top - pad, left: box.left - pad, width: box.width + pad * 2, height: box.height + pad * 2 }}
        />
      )}

      <div
        className="absolute w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-panel p-4 shadow-[0_30px_80px_-24px_rgba(20,23,32,0.6)]"
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
            <button onClick={stop} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-muted hover:text-ink">
              Skip
            </button>
            {i === STEPS.length - 1 ? (
              <Link
                href="/signup?plan=visibility"
                onClick={stop}
                className="inline-flex items-center gap-1 rounded-full bg-cyan px-3.5 py-1.5 text-xs font-semibold text-ink-inverse hover:bg-cyan-dim"
              >
                Start your own <Icon name="arrow-right" size={13} />
              </Link>
            ) : (
              <button
                onClick={() => go(i + 1)}
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
