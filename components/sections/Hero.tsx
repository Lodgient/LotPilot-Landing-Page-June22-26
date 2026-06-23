"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion-config";

const TRUST = ["Delaware C-Corp", "US data only", "FCRA-aligned", "No lead reselling"];

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
          transition={{ duration: 0.8, delay: 0.05 + i * 0.1, ease: EASE }}
        >
          {children}
        </motion.span>
      )}
    </span>
  );

  const fade = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay, ease: EASE } };

  return (
    <section className="relative isolate overflow-hidden bg-[#0a0b0d] pt-32 text-[#ece3cf] sm:pt-36">
      {/* subtle ambient behind the text (no photo here — clean) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60%]">
        <div className="bg-grid absolute inset-0 opacity-[0.07]" />
        <div className="glow-cyan absolute left-1/2 top-0 h-[420px] w-[760px] -translate-x-1/2 opacity-30" />
      </div>

      {/* TEXT — clean, on dark */}
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-5 text-center sm:px-8">
        <motion.p
          {...fade(0)}
          className="mb-5 text-[11px] font-medium uppercase tracking-[0.42em] text-[#ece3cf]/55"
        >
          LotPilot — AI visibility for dealers
        </motion.p>

        <h1 className="font-serif text-[clamp(2.5rem,8vw,6.5rem)] font-normal uppercase leading-[0.92] tracking-[-0.01em]">
          <Line i={0}>
            Found by{" "}
            <span className="bg-gradient-to-r from-accent via-cyan to-violet bg-clip-text text-transparent">AI.</span>
          </Line>
          <Line i={1}>
            Worked by{" "}
            <span className="bg-gradient-to-r from-accent via-cyan to-violet bg-clip-text text-transparent">AI.</span>
          </Line>
        </h1>

        <motion.p
          {...fade(0.2)}
          className="mt-6 max-w-xl text-pretty text-sm leading-relaxed text-[#ece3cf]/75 sm:text-base"
        >
          Your inventory, recommended inside ChatGPT, Perplexity &amp; Gemini — then AI agents work
          every lead in seconds. <span className="text-[#ece3cf]">You just send the feed.</span>
        </motion.p>

        <motion.div
          {...fade(0.3)}
          className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
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
            className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full border border-white/25 px-7 text-sm font-medium text-[#ece3cf] transition-colors hover:bg-white/10"
          >
            Book a demo
          </a>
        </motion.div>

        <motion.div
          {...fade(0.4)}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium tracking-wide text-[#ece3cf]/45"
        >
          {TRUST.map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <span className="text-accent">✓</span> {t}
            </span>
          ))}
        </motion.div>
      </div>

      {/* IMAGE — full-width cinematic showpiece, unobstructed, below the text */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 30 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
        className="relative mt-14 h-[clamp(360px,52vh,640px)] w-full"
      >
        <Image
          src="/media/hero-portal.webp"
          alt="A luxury vehicle within a glowing ring — recommended by AI"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* blend the image top into the dark text area + bottom into the next section */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0a0b0d] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0b0d] to-transparent" />
      </motion.div>
    </section>
  );
}
