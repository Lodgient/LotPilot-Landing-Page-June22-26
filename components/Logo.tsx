import Image from "next/image";
import { cn } from "@/lib/cn";

export default function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/lotpilot-icon.png"
        alt="LotPilot"
        width={20}
        height={28}
        priority
        className="h-7 w-auto shrink-0"
      />
      <span className="text-[15px] font-semibold tracking-tight">
        Lot<span className="text-ink-muted">Pilot</span>
      </span>
    </span>
  );
}
