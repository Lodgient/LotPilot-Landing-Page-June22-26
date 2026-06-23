"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { RUN_AUDIT_EVENT, type RunAuditDetail } from "@/components/audit/AuditTool";
import { EASE } from "@/lib/motion-config";

const TRUST = ["Delaware C-Corp", "US data only", "FCRA-aligned", "No lead reselling"];
const ENGINES = ["ChatGPT", "Perplexity", "Gemini", "Google AI Overviews", "Bing Copilot", "Claude"];

export default function Hero() {
  const [url, setUrl] = useState("");
  const reduce = useReducedMotion();

  function launch() {
    const detail: RunAuditDetail = { url: url.trim(), city: "" };
    document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" });
    if (url.trim()) {
      window.setTimeout(() => window.dispatchEvent(new CustomEvent(RUN_AUDIT_EVENT, { detail })), 350);
    }
  }

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
      {/* clean light backdrop — soft brand wash + faint grid, no photo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="absolute left-1/2 top-[-10%] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(8,145,178,0.10),transparent)]" />
        <div className="glow-accent absolute -left-20 top-24 h-[380px] w-[380px] opacity-40" />
        <div className="glow-violet absolute -right-20 top-10 h-[380px] w-[380px] opacity-35" />
      </div>

      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <motion.span
          {...rise(0)}
          className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white/80 px-4 py-1.5 text-xs font-medium text-ink-soft shadow-sm backdrop-blur"
        >
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
          Buyers now ask AI which car to buy
        </motion.span>

        <motion.h1
          {...rise(0.06)}
          className="mx-auto mt-6 max-w-3xl text-balance text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl"
        >
          Your inventory,{" "}
          <span className="font-display text-gradient">recommended by AI.</span>{" "}
          Your leads, <span className="font-display text-gradient">worked by AI.</span>
        </motion.h1>

        <motion.p
          {...rise(0.12)}
          className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-ink-muted sm:text-lg"
        >
          LotPilot makes every car you stock discoverable inside ChatGPT, Perplexity, Gemini
          and Google AI Overviews — then our AI agents work every lead in seconds: qualify,
          take credit apps, book the deal.{" "}
          <span className="font-medium text-ink">You just send the feed.</span>
        </motion.p>

        {/* audit launcher */}
        <motion.div {...rise(0.18)} className="mx-auto mt-9 flex max-w-xl flex-col gap-2 sm:flex-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && launch()}
            type="url"
            inputMode="url"
            aria-label="Dealership website"
            placeholder="yourdealership.com"
            className="h-[52px] flex-1 rounded-2xl border border-line-strong bg-white px-5 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-cyan/60 focus:outline-none"
          />
          <button
            onClick={launch}
            className="inline-flex h-[52px] shrink-0 items-center justify-center whitespace-nowrap rounded-2xl bg-cyan px-7 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow"
          >
            Run the free 60-second check →
          </button>
        </motion.div>
        <motion.div {...rise(0.24)} className="mt-4">
          <a href="#demo" className="text-sm text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline">
            or connect your feed / book a demo →
          </a>
        </motion.div>

        <motion.div
          {...rise(0.3)}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-ink-faint"
        >
          {TRUST.map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <span className="text-accent">✓</span> {t}
            </span>
          ))}
        </motion.div>
      </div>

      {/* product showpiece — the real dashboard, floating */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 40 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.34, ease: EASE }}
        className="relative mx-auto mt-16 max-w-6xl px-5 sm:mt-20 sm:px-8"
      >
        {/* glow behind */}
        <div className="pointer-events-none absolute -inset-x-10 -top-10 bottom-0 -z-10">
          <div className="mx-auto h-full w-3/4 bg-[radial-gradient(closest-side,rgba(8,145,178,0.18),transparent)] blur-2xl" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-line-strong bg-white shadow-[0_40px_120px_-30px_rgba(13,17,23,0.35)] ring-1 ring-black/5">
          {/* browser chrome */}
          <div className="flex items-center gap-2 border-b border-line bg-canvas-2 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-black/15" />
            <span className="h-3 w-3 rounded-full bg-black/15" />
            <span className="h-3 w-3 rounded-full bg-black/15" />
            <span className="mx-auto inline-flex items-center gap-2 rounded-md bg-white px-3 py-1 text-[11px] text-ink-faint ring-1 ring-line">
              app.lotpilot.com/dashboard
            </span>
          </div>
          <Image
            src="/media/dashboard-preview.png"
            alt="The LotPilot dealer dashboard — AI visibility, leads worked, and ROI"
            width={2880}
            height={1800}
            priority
            className="w-full"
          />
        </div>
      </motion.div>

      {/* engine marquee */}
      <div className="relative mt-20 overflow-hidden">
        <p className="mb-4 text-center text-xs font-mono uppercase tracking-[0.25em] text-ink-faint">
          Built to be cited by
        </p>
        <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <div className="marquee flex shrink-0 items-center gap-12 pr-12">
            {[...ENGINES, ...ENGINES].map((e, i) => (
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
