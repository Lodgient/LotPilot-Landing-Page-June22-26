import Image from "next/image";
import { cn } from "@/lib/cn";

export default function Logo({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {/* The brand mark is a light teal→lime line-art built for dark grounds, so
          it sits on a near-black tile with an adaptive ring — vivid and clearly
          visible on both the dark hero and white surfaces. */}
      <span
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#0d1626] to-[#080c14] shadow-[0_6px_18px_-6px_rgba(0,0,0,0.55)] ring-1",
          onDark ? "ring-white/30" : "ring-black/10",
        )}
      >
        <Image
          src="/lotpilot-icon.png"
          alt="LotPilot"
          width={20}
          height={28}
          priority
          className="h-7 w-auto"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-serif text-[22px] font-semibold tracking-[-0.01em] transition-colors",
            onDark ? "text-[#f8fafc]" : "text-ink",
          )}
        >
          LotPilot
        </span>
        <span
          className={cn(
            "mt-1 text-[9px] font-semibold uppercase leading-[1.5] tracking-[0.16em] transition-colors",
            onDark ? "text-[#f8fafc]/80" : "text-cyan",
          )}
        >
          AI visibility for automotive dealers
        </span>
      </span>
    </span>
  );
}
