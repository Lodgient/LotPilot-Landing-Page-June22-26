import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Reveal from "./Reveal";

type Glow = "accent" | "cyan" | "violet" | "none";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  /** Center the header block. Default true. */
  centered?: boolean;
  /** Ambient colored bloom + which side it sits on. */
  glow?: Glow;
  glowSide?: "left" | "right" | "center";
  /** Slightly lifted panel tone to alternate against the canvas. */
  tinted?: boolean;
}

const GLOW_CLASS: Record<Exclude<Glow, "none">, string> = {
  accent: "glow-accent",
  cyan: "glow-cyan",
  violet: "glow-violet",
};

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-black/[0.03] px-3 py-1 text-xs font-mono uppercase tracking-[0.2em] text-accent">
      <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px] shadow-accent" />
      {children}
    </span>
  );
}

export default function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className,
  containerClassName,
  centered = true,
  glow = "none",
  glowSide = "center",
  tinted = false,
}: SectionProps) {
  const sidePos =
    glowSide === "left"
      ? "left-[-10%] top-10"
      : glowSide === "right"
        ? "right-[-10%] top-10"
        : "left-1/2 top-0 -translate-x-1/2";

  return (
    <section
      id={id}
      className={cn(
        "relative py-20 sm:py-28",
        tinted && "bg-canvas-2/60",
        className,
      )}
    >
      {tinted && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" />
      )}
      {glow !== "none" && (
        <div
          aria-hidden
          className={cn(
            "drift-slow pointer-events-none absolute h-[520px] w-[520px] opacity-70",
            GLOW_CLASS[glow],
            sidePos,
          )}
        />
      )}

      <div className={cn("relative mx-auto w-full max-w-7xl px-5 sm:px-8", containerClassName)}>
        {(eyebrow || title || intro) && (
          <Reveal
            className={cn("mb-12 max-w-3xl sm:mb-16", centered && "mx-auto text-center")}
          >
            {eyebrow && <div className="mb-4">{<Eyebrow>{eyebrow}</Eyebrow>}</div>}
            {title && (
              <h2 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
                {title}
              </h2>
            )}
            {intro && (
              <p className="mt-5 text-pretty text-base leading-relaxed text-ink-soft sm:text-lg">
                {intro}
              </p>
            )}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
