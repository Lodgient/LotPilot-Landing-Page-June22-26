"use client";

import { motion, useReducedMotion } from "framer-motion";

const STATS = [
  { v: "5", l: "AI engines, one feed" },
  { v: "Zero", l: "Setup or hardware" },
  { v: "24/7", l: "Lead response" },
];

const ease = [0.19, 1, 0.22, 1] as const;

export default function Hero() {
  const reduce = useReducedMotion();

  const Line = ({ children, i }: { children: React.ReactNode; i: number }) => (
    <span className="block overflow-hidden pb-[0.08em]">
      {reduce ? (
        <span className="block">{children}</span>
      ) : (
        <motion.span
          className="block"
          initial={{ y: "115%" }}
          animate={{ y: 0 }}
          transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease }}
        >
          {children}
        </motion.span>
      )}
    </span>
  );

  const fade = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay, ease } };

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#0a0f1a]">
      {/* cinematic dealership showroom photo + Ken Burns */}
      <div className="absolute inset-[-6%] z-0">
        <div className="kenburns absolute inset-0 bg-[url('/media/hero-dealership.webp')] bg-cover bg-center [filter:saturate(1.12)_brightness(1.16)]" />
      </div>
      {/* legibility overlays — lightened so the showroom shows through; left stays readable */}
      <div className="absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(8,12,20,0.18)_0%,transparent_38%,transparent_64%,rgba(6,10,18,0.72)_100%)]" />
      <div className="absolute inset-0 z-[2] bg-[linear-gradient(100deg,rgba(6,10,18,0.72)_0%,rgba(8,12,20,0.3)_40%,transparent_66%)]" />
      <div className="pointer-events-none absolute left-[-4%] top-[6%] z-[2] h-[70%] w-[60%] bg-[radial-gradient(ellipse_at_30%_40%,rgba(56,189,248,0.18),transparent_60%)] blur-2xl" />

      <div className="relative z-[5] mx-auto w-full max-w-[1240px] px-7 pb-28 pt-32 text-[#f8fafc] sm:px-14">
        <motion.div
          {...fade(0)}
          className="mb-9 inline-flex items-center gap-3 rounded-full border border-[#5b8def]/45 bg-[#0b1220]/55 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.28em] text-[#8fc7ff] backdrop-blur"
        >
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#38bdf8] shadow-[0_0_10px_#38bdf8]" />
          AI visibility for car dealers
        </motion.div>

        <h1 className="max-w-[15ch] font-serif text-[clamp(46px,7.4vw,100px)] font-semibold leading-[1.02] tracking-[-0.03em] drop-shadow-[0_2px_34px_rgba(6,10,18,0.6)]">
          <Line i={0}>One feed.</Line>
          <Line i={1}>
            <span className="text-[#5cb8ff]">Every</span> AI engine.
          </Line>
        </h1>

        <motion.p
          {...fade(0.55)}
          className="mt-8 max-w-[34rem] text-pretty text-[19px] font-normal leading-[1.8] text-[#f8fafc]/95 drop-shadow-[0_1px_22px_rgba(11,26,22,0.6)]"
        >
          LotPilot makes every car you stock discoverable inside ChatGPT, Perplexity, Gemini and
          Google AI Overviews — then AI agents work every lead in seconds. You just send the feed.
        </motion.p>

        <motion.div {...fade(0.68)} className="mt-11 flex flex-wrap gap-4">
          <a
            href="#audit"
            data-cursor
            className="group inline-flex items-center gap-3 rounded-sm bg-[#2563eb] px-9 py-[18px] text-[12px] font-medium uppercase tracking-[1.5px] text-white shadow-[0_12px_40px_-12px_rgba(37,99,235,0.7)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#1d4ed8]"
          >
            Run the free AI-visibility check
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#how"
            data-cursor
            className="inline-flex items-center rounded-sm border border-[#f8fafc]/30 px-9 py-[18px] text-[12px] font-medium uppercase tracking-[1.5px] text-[#f8fafc] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#f8fafc] hover:text-[#0f1722]"
          >
            See how it works
          </a>
        </motion.div>
      </div>

      {/* stat bar */}
      <motion.div
        {...fade(0.85)}
        className="absolute inset-x-0 bottom-0 z-[5] border-t border-[#f8fafc]/15 bg-[#0b1220]/40 backdrop-blur-sm"
      >
        <div className="mx-auto flex max-w-[1240px] items-center px-7 py-6 sm:px-14">
          {STATS.map((s, i) => (
            <div
              key={s.l}
              className={`px-6 first:pl-0 sm:px-12 ${i < STATS.length - 1 ? "border-r border-[#f8fafc]/14" : ""}`}
            >
              <div className="font-serif text-3xl leading-none text-[#f8fafc]">{s.v}</div>
              <div className="mt-1.5 text-[10px] uppercase tracking-[2px] text-[#dcd3c3]">{s.l}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
