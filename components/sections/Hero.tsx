"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion-config";

const ENGINES = ["ChatGPT", "Perplexity", "Gemini", "Google AI Overviews", "Bing Copilot"];
const TRUST = ["Delaware C-Corp", "US data only", "FCRA-aligned", "No lead reselling"];

export default function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: EASE } };
  const pop = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 12, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.55, delay, ease: EASE } };

  return (
    <section className="relative overflow-hidden bg-white">
      {/* airy light backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[70%] bg-gradient-to-b from-cyan/[0.06] via-white to-white" />
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="glow-accent absolute -left-24 top-24 h-[360px] w-[360px] opacity-35" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-32 sm:px-8 sm:pb-24 sm:pt-40 lg:grid-cols-[1.02fr_0.98fr]">
        {/* LEFT — copy */}
        <div className="max-w-xl">
          <motion.span
            {...fade(0)}
            className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white px-4 py-1.5 text-xs font-medium text-ink-soft shadow-sm"
          >
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
            Buyers now ask AI which car to buy
          </motion.span>

          <motion.h1
            {...fade(0.06)}
            className="mt-5 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            Your inventory, <span className="text-gradient">recommended by AI.</span>{" "}
            Your leads, <span className="text-gradient">worked by AI.</span>
          </motion.h1>

          <motion.p
            {...fade(0.12)}
            className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-ink-muted sm:text-lg"
          >
            LotPilot makes every car you stock discoverable inside ChatGPT, Perplexity, Gemini and
            Google AI Overviews — then our AI agents work every lead in seconds.{" "}
            <span className="font-medium text-ink">You just send the feed.</span>
          </motion.p>

          <motion.div {...fade(0.18)} className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="#audit"
              data-cursor
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full bg-cyan px-7 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow"
            >
              Run the free 60-second check →
            </a>
            <a
              href="#demo"
              data-cursor
              className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full border border-line-strong bg-white px-7 text-sm font-medium text-ink shadow-sm transition-colors hover:border-cyan/50"
            >
              Book a demo
            </a>
          </motion.div>

          <motion.div
            {...fade(0.26)}
            className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-ink-faint"
          >
            {TRUST.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <span className="text-accent">✓</span> {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — car scene in a rounded panel + floating product cards */}
        <motion.div {...pop(0.22)} className="relative">
          <div className="glow-cyan pointer-events-none absolute -inset-6 -z-10 opacity-60" />
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-[0_40px_100px_-30px_rgba(13,17,23,0.35)] ring-1 ring-black/5">
            <Image
              src="/media/hero-light.webp"
              alt="A luxury SUV under a bright sky — discoverable by AI with LotPilot"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>

          {/* engine pills (top) */}
          <motion.div {...pop(0.4)} className="absolute -top-4 left-6 flex flex-wrap gap-2">
            {ENGINES.slice(0, 3).map((e) => (
              <span
                key={e}
                className="rounded-full border border-line bg-white/95 px-3 py-1.5 text-xs font-medium text-ink shadow-md backdrop-blur"
              >
                {e}
              </span>
            ))}
          </motion.div>

          {/* cited chip (left) */}
          <motion.div
            {...pop(0.5)}
            className="absolute -left-5 top-1/3 inline-flex items-center gap-2 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-xl backdrop-blur"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/12 text-accent ring-1 ring-inset ring-accent/20">
              ✓
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Cited by 5 AI engines</p>
              <p className="text-xs text-ink-muted">when buyers ask what to buy</p>
            </div>
          </motion.div>

          {/* overnight gross card (bottom-right) */}
          <motion.div
            {...pop(0.6)}
            className="absolute -bottom-5 right-4 w-60 rounded-2xl border border-line bg-white/95 p-4 shadow-2xl backdrop-blur"
          >
            <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
              AI-influenced gross · overnight
            </p>
            <p className="mt-0.5 text-3xl font-bold tracking-tight text-ink">$31,400</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-ink-muted">14 leads · 2 appts</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-[11px] font-semibold text-accent">
                ▲ 2× a typical night
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* engine marquee */}
      <div className="relative border-t border-line/70 py-6">
        <p className="mb-4 text-center text-xs font-mono uppercase tracking-[0.25em] text-ink-faint">
          Built to be cited by
        </p>
        <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <div className="marquee flex shrink-0 items-center gap-12 pr-12">
            {[...ENGINES, "Claude", ...ENGINES, "Claude"].map((e, i) => (
              <span key={`${e}-${i}`} className="whitespace-nowrap text-lg font-medium text-ink-muted/70">
                {e}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
