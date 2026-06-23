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
    <section className="relative isolate overflow-hidden bg-[#0a0b0d] text-[#ece3cf]">
      {/* cinematic backdrop */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/media/hero-portal.webp"
          alt="A luxury vehicle within a glowing ring — recommended by AI"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,transparent_18%,rgba(10,11,13,0.5)_64%,#0a0b0d_93%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0b0d]/85 via-transparent to-[#0a0b0d]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-5 py-32 text-center sm:px-8 sm:py-40">
        <motion.p
          {...fade(0)}
          className="mb-5 text-[11px] font-medium uppercase tracking-[0.42em] text-[#ece3cf]/55"
        >
          LotPilot — AI visibility for dealers
        </motion.p>

        <h1 className="font-serif text-[clamp(2.5rem,9vw,7.25rem)] font-normal uppercase leading-[0.92] tracking-[-0.01em]">
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
          className="mt-7 max-w-xl text-pretty text-sm leading-relaxed text-[#ece3cf]/75 sm:text-base"
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
            className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full border border-white/25 px-7 text-sm font-medium text-[#ece3cf] backdrop-blur transition-colors hover:bg-white/10"
          >
            Book a demo
          </a>
        </motion.div>

        <motion.div
          {...fade(0.4)}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium tracking-wide text-[#ece3cf]/45"
        >
          {TRUST.map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <span className="text-accent">✓</span> {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
