"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

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
    <section ref={ref} className="relative isolate overflow-hidden bg-[#0a0e16] text-white">
      {/* full-bleed cinematic backdrop — luxury dealership at dusk */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          style={{ y: reduce ? 0 : imgY }}
          className="absolute inset-x-0 -inset-y-[12%] will-change-transform"
        >
          <Image
            src="/hero-car.webp"
            alt="A modern luxury car dealership at dusk — LotPilot"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
        {/* darken left + bottom so the headline + form read crisply */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b12]/90 via-[#070b12]/55 to-[#070b12]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b12]/85 via-transparent to-[#070b12]/35" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl py-28 sm:py-36 lg:py-44">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur"
          >
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
            Buyers now ask AI which car to buy
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease }}
            className="mt-6 text-5xl font-semibold leading-[1.07] tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.4)] sm:text-6xl"
          >
            <span className="block">Your inventory,</span>
            <span className="block font-display bg-gradient-to-r from-accent via-cyan to-violet bg-clip-text text-transparent">
              recommended by AI.
            </span>
            <span className="mt-1 block">Your leads,</span>
            <span className="block font-display bg-gradient-to-r from-accent via-cyan to-violet bg-clip-text text-transparent">
              worked by AI.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease }}
            className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/80 sm:text-lg"
          >
            LotPilot makes every car you stock discoverable inside ChatGPT, Perplexity,
            Gemini and Google AI Overviews — then our AI agents work every lead in
            seconds: qualify, take credit apps, book the deal.
            <span className="font-medium text-white"> You just send the feed.</span>
          </motion.p>

          {/* audit launcher — white card pops on the dark scene */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease }}
            className="mt-8 max-w-lg"
          >
            <div className="rounded-2xl border border-white/15 bg-white p-2.5 shadow-2xl">
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
              className="mt-3 inline-block text-sm text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              or connect your feed / book a demo →
            </a>
          </motion.div>

          {/* trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-white/75"
          >
            {TRUST.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <span className="text-accent">✓</span> {t}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* engine marquee — quiet band closing the dark hero */}
      <div className="relative border-t border-white/10 py-6">
        <p className="mb-4 text-center text-xs font-mono uppercase tracking-[0.25em] text-white/40">
          Built to be cited by
        </p>
        <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <div className="marquee flex shrink-0 items-center gap-12 pr-12">
            {[...ENGINES, ...ENGINES].map((e, i) => (
              <span
                key={`${e}-${i}`}
                className="whitespace-nowrap text-lg font-medium text-white/55"
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
