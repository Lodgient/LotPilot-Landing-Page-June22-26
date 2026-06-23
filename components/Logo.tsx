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
      <Image
        src="/lotpilot-icon.png"
        alt="LotPilot"
        width={20}
        height={28}
        priority
        className="h-7 w-auto shrink-0"
      />
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
            "mt-1 text-[9px] font-medium uppercase tracking-[0.28em] transition-colors",
            onDark ? "text-[#f8fafc]/85" : "text-cyan",
          )}
        >
          AI visibility for dealers
        </span>
      </span>
    </span>
  );
}
