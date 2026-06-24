"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const SHOTS = [
  {
    src: "/product/visibility.webp",
    label: "dashboard/visibility",
    title: "AI Visibility",
    tag: "What every AI says about you",
    body: "See what ChatGPT, Grok, Perplexity, Gemini and Claude say about your store — per engine, with the live answer monitor.",
  },
  {
    src: "/product/command.webp",
    label: "dashboard",
    title: "Command Center",
    tag: "Your overnight recap",
    body: "Every morning: what your AI did overnight — gross influenced, leads worked, appointments booked.",
  },
  {
    src: "/product/inventory.webp",
    label: "dashboard/inventory",
    title: "Inventory AI",
    tag: "Every car, scored",
    body: "Every car scored for AI visibility and ranked by the gross it's leaving on the table.",
  },
  {
    src: "/product/roi.webp",
    label: "dashboard/roi",
    title: "ROI & Attribution",
    tag: "Gross traced to AI",
    body: "Sold cars and gross traced to the exact AI engine that produced them.",
  },
];

export default function ShowcaseGallery() {
  const [active, setActive] = useState(0);
  const cur = SHOTS[active];

  return (
    <div>
      {/* compact selectable tabs — a row across the top */}
      <div role="tablist" aria-label="Product views" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {SHOTS.map((s, i) => {
          const on = active === i;
          return (
            <button
              key={s.src}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(i)}
              className={cn(
                "group flex items-center gap-3 rounded-xl border p-2 text-left transition-all",
                on
                  ? "border-cyan/60 bg-cyan/[0.05] ring-1 ring-cyan/25"
                  : "border-line bg-panel hover:border-line-strong hover:bg-canvas-2",
              )}
            >
              <span className="relative shrink-0 overflow-hidden rounded-md ring-1 ring-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.src}
                  alt=""
                  loading="lazy"
                  className={cn(
                    "block h-11 w-[68px] object-cover transition-opacity",
                    on ? "opacity-100" : "opacity-80 group-hover:opacity-100",
                  )}
                />
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-sm font-semibold transition-colors",
                    on ? "text-cyan" : "text-ink",
                  )}
                >
                  {s.title}
                </span>
                <span className="mt-0.5 block truncate text-xs text-ink-muted">{s.tag}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* active title + description */}
      <div className="mt-6 text-center">
        <p className="text-base font-semibold text-ink">{cur.title}</p>
        <p className="mx-auto mt-1 max-w-2xl text-sm leading-relaxed text-ink-muted">{cur.body}</p>
      </div>

      {/* the big preview */}
      <div className="mt-4 overflow-hidden rounded-xl border border-line-strong bg-panel shadow-[0_30px_80px_-32px_rgba(15,23,34,0.38)]">
        <div className="flex items-center gap-1.5 border-b border-line bg-canvas-2 px-3.5 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-warn/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/40" />
          <span className="ml-2 truncate text-[10px] text-ink-faint">
            dealers.lotpilot.com/{cur.label}
          </span>
        </div>
        <div className="relative aspect-[16/10] bg-canvas-2">
          <motion.img
            key={cur.src}
            src={cur.src}
            alt={`LotPilot ${cur.title}`}
            width={1600}
            height={1000}
            initial={{ opacity: 0, scale: 1.008 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 block h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
