"use client";

import { useState } from "react";
import Image from "next/image";
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

const ease = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const [url, setUrl] = useState("");
  const [city, setCity] = useState("");

  function launch() {
    if (!url.trim()) {
      document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const detail: RunAuditDetail = { url: url.trim(), city: city.trim() };
    document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(RUN_AUDIT_EVENT, { detail }));
    }, 350);
  }

  return (
    <section className="relative isolate overflow-hidden">
      {/* full-bleed cinematic backdrop — luxury SUV, car bleeds off the right */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-car.webp"
          alt="A luxury SUV, recommended by AI — LotPilot"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[78%_center]"
        />
        {/* left → right wash keeps the headline crisp on the clean side */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent" />
        {/* extra veil on small screens where the car sits under the copy */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-white/30 lg:hidden" />
        <div className="bg-grid absolute inset-0 opacity-40" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl py-24 sm:py-32 lg:py-40">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white/70 px-4 py-1.5 text-xs font-medium text-ink-soft shadow-sm backdrop-blur"
          >
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
            Buyers now ask AI which car to buy
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease }}
            className="mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Your inventory,{" "}
            <span className="font-display text-gradient">recommended by AI.</span>
            <br className="hidden sm:block" /> Your leads,{" "}
            <span className="font-display text-gradient">worked by AI.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease }}
            className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-muted sm:text-lg"
          >
            LotPilot makes every car you stock discoverable inside ChatGPT, Perplexity,
            Gemini and Google AI Overviews — then our AI agents work every lead in
            seconds: qualify, take credit apps, book the deal.
            <span className="font-medium text-ink-soft"> You just send the feed.</span>
          </motion.p>

          {/* audit launcher */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease }}
            className="mt-8 max-w-lg"
          >
            <div className="surface rounded-2xl p-2.5 shadow-xl ring-1 ring-black/[0.04]">
              <p className="px-2 pt-1 text-left text-sm font-medium text-ink-soft">
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
                  className="h-12 flex-1 rounded-xl border border-line-strong bg-canvas px-4 text-sm text-ink placeholder:text-ink-faint focus:border-cyan/60 focus:outline-none"
                />
                <button
                  onClick={launch}
                  className="h-12 shrink-0 whitespace-nowrap rounded-xl bg-cyan px-6 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow"
                >
                  Check now →
                </button>
              </div>
            </div>
            <a
              href="#demo"
              className="mt-3 inline-block text-sm text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              or connect your feed / book a demo →
            </a>
          </motion.div>

          {/* trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-faint"
          >
            {TRUST.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <span className="text-accent">✓</span> {t}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* engine marquee */}
      <div className="relative border-t border-line/60 bg-canvas/60 py-6 backdrop-blur-sm">
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
