import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Reveal from "./Reveal";

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
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-accent">
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
}: SectionProps) {
  return (
    <section id={id} className={cn("relative py-20 sm:py-28", className)}>
      <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", containerClassName)}>
        {(eyebrow || title || intro) && (
          <Reveal
            className={cn(
              "mb-12 sm:mb-16 max-w-3xl",
              centered && "mx-auto text-center",
            )}
          >
            {eyebrow && <div className="mb-4">{<Eyebrow>{eyebrow}</Eyebrow>}</div>}
            {title && (
              <h2 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
                {title}
              </h2>
            )}
            {intro && (
              <p className="mt-5 text-pretty text-base leading-relaxed text-ink-muted sm:text-lg">
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
