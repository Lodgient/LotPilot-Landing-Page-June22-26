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
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* Mark in a badge — near-black on light, frosted glass on dark. */}
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-xl ring-1 transition-colors",
          onDark
            ? "bg-white/10 ring-white/25 backdrop-blur"
            : "bg-ink shadow-[0_4px_14px_-4px_rgba(13,17,23,0.45)] ring-black/5",
        )}
      >
        <Image
          src="/lotpilot-icon.png"
          alt="LotPilot"
          width={20}
          height={28}
          priority
          className="h-5 w-auto shrink-0"
        />
      </span>
      <span
        className={cn(
          "text-[17px] font-semibold tracking-tight transition-colors",
          onDark ? "text-white" : "text-ink",
        )}
      >
        Lot<span className={onDark ? "text-white/55" : "text-ink-muted"}>Pilot</span>
      </span>
    </span>
  );
}
