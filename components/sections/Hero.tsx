"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RUN_AUDIT_EVENT, type RunAuditDetail } from "@/components/audit/AuditTool";

const TRUST = ["Delaware C-Corp", "US data only", "FCRA-aligned", "No lead reselling"];
const ENGINES = [
  "ChatGPT",
  "Perplexity",
  "Gemini",
  "Google AI Overviews",
  "Bing Copilot",
  "Claude",
];

export default function Hero() {
  const [url, setUrl] = useState("");
  const [city, setCity] = useState("");

  function launch() {
    if (!url.trim()) {
      // soft focus the field; still scroll to the tool
      document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const detail: RunAuditDetail = { url: url.trim(), city: city.trim() };
    document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" });
    // let the scroll start, then run
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(RUN_AUDIT_EVENT, { detail }));
    }, 350);
  }

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      {/* ambient background */}
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="glow-accent pointer-events-none absolute -top-40 left-1/4 h-[520px] w-[520px] -translate-x-1/2" />
      <div className="glow-cyan pointer-events-none absolute -top-20 right-0 h-[480px] w-[480px]" />

      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-black/[0.03] px-4 py-1.5 text-xs text-ink-soft">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
            Buyers now ask AI which car to buy
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
        >
          Your inventory,{" "}
          <span className="font-display text-gradient">recommended by AI.</span>
          <br className="hidden sm:block" /> Your leads,{" "}
          <span className="font-display text-gradient">worked by AI.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-ink-muted sm:text-lg"
        >
          LotPilot makes every car you stock discoverable inside ChatGPT,
          Perplexity, Gemini and Google AI Overviews — then our AI agents work
          every lead in seconds: qualify, take credit apps, book the deal.
          <span className="text-ink-soft"> You just send the feed.</span>
        </motion.p>

        {/* Hero audit launcher */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-10 max-w-2xl"
        >
          <div className="surface rounded-2xl p-2 sm:p-2.5">
            <p className="px-3 pt-2 text-left text-sm font-medium text-ink-soft">
              See if AI can find your inventory —{" "}
              <span className="text-accent">free 60-second check</span>
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && launch()}
                type="url"
                inputMode="url"
                aria-label="Dealership website"
                placeholder="yourdealership.com"
                className="h-12 flex-[1.5] rounded-xl border border-line-strong bg-black/[0.03] px-4 text-sm text-ink placeholder:text-ink-faint focus:border-cyan/60 focus:outline-none"
              />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && launch()}
                aria-label="City or metro"
                placeholder="City / metro"
                className="h-12 flex-1 rounded-xl border border-line-strong bg-black/[0.03] px-4 text-sm text-ink placeholder:text-ink-faint focus:border-cyan/60 focus:outline-none"
              />
              <button
                onClick={launch}
                className="h-12 shrink-0 whitespace-nowrap rounded-xl bg-cyan px-6 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan/90 cta-glow"
              >
                Check now →
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <a
              href="#demo"
              className="text-sm text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              or connect your feed / book a demo →
            </a>
          </div>
        </motion.div>

        {/* trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-faint"
        >
          {TRUST.map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <span className="text-accent">✓</span> {t}
            </span>
          ))}
        </motion.div>
      </div>

      {/* engine marquee */}
      <div className="relative mt-16 overflow-hidden">
        <p className="mb-4 text-center text-xs font-mono uppercase tracking-[0.25em] text-ink-faint">
          Built to be cited by
        </p>
        <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <div className="marquee flex shrink-0 items-center gap-12 pr-12">
            {[...ENGINES, ...ENGINES].map((e, i) => (
              <span
                key={`${e}-${i}`}
                className="whitespace-nowrap text-lg font-medium text-ink-muted/70"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
