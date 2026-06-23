import Image from "next/image";
import { cn } from "@/lib/cn";

export default function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* Seat the gradient mark in a near-black badge so it reads on white. */}
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink shadow-[0_4px_14px_-4px_rgba(13,17,23,0.45)] ring-1 ring-black/5">
        <Image
          src="/lotpilot-icon.png"
          alt="LotPilot"
          width={20}
          height={28}
          priority
          className="h-5 w-auto shrink-0"
        />
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-ink">
        Lot<span className="text-ink-muted">Pilot</span>
      </span>
    </span>
  );
}
