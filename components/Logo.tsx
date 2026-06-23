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
      {/* The brand mark is a light teal→lime line-art built for dark grounds,
          so it sits on a small dark tile to stay vivid on light surfaces too. */}
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0f1722] shadow-sm ring-1 ring-white/10">
        <Image
          src="/lotpilot-icon.png"
          alt="LotPilot"
          width={20}
          height={28}
          priority
          className="h-6 w-auto"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-serif text-[21px] font-medium uppercase tracking-[0.12em] transition-colors",
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
