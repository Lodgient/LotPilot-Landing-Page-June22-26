"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const SHOTS = [
  {
    src: "/product/visibility.webp",
    label: "dashboard/visibility",
    title: "AI Visibility",
    body: "See what ChatGPT, Grok, Perplexity, Gemini and Claude say about your store — per engine, with the live answer monitor.",
  },
  {
    src: "/product/command.webp",
    label: "dashboard",
    title: "Command Center",
    body: "Every morning: what your AI did overnight — gross influenced, leads worked, appointments booked.",
  },
  {
    src: "/product/inventory.webp",
    label: "dashboard/inventory",
    title: "Inventory AI",
    body: "Every car scored for AI visibility and ranked by the gross it's leaving on the table.",
  },
  {
    src: "/product/roi.webp",
    label: "dashboard/roi",
    title: "ROI & Attribution",
    body: "Sold cars and gross traced to the exact AI engine that produced them.",
  },
];

export default function ShowcaseGallery() {
  const [active, setActive] = useState(0);
  const cur = SHOTS[active];

  return (
    <div>
      {/* main frame */}
      <div className="overflow-hidden rounded-xl border border-line-strong bg-panel shadow-[0_30px_80px_-32px_rgba(15,23,34,0.38)]">
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

      <div className="mt-5 text-center">
        <p className="text-base font-semibold text-ink">{cur.title}</p>
        <p className="mx-auto mt-1 max-w-2xl text-sm leading-relaxed text-ink-muted">{cur.body}</p>
      </div>

      {/* clickable thumbnails */}
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SHOTS.map((s, i) => (
          <button
            key={s.src}
            onClick={() => setActive(i)}
            aria-pressed={active === i}
            className={cn(
              "group rounded-lg border bg-panel p-1.5 text-left transition-all",
              active === i
                ? "border-cyan/60 ring-2 ring-cyan/30"
                : "border-line hover:-translate-y-0.5 hover:border-line-strong",
            )}
          >
            <div className="overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={s.title}
                loading="lazy"
                className={cn(
                  "block aspect-[16/10] w-full object-cover transition-opacity",
                  active === i ? "opacity-100" : "opacity-70 group-hover:opacity-100",
                )}
              />
            </div>
            <p
              className={cn(
                "mt-2 px-1 pb-0.5 text-xs font-semibold transition-colors",
                active === i ? "text-cyan" : "text-ink-soft group-hover:text-ink",
              )}
            >
              {s.title}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
