import { cn } from "@/lib/cn";

export default function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M12 2L21 7v10l-9 5-9-5V7l9-5z"
          stroke="url(#lp-g)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M12 7l4 2.5v5L12 17l-4-2.5v-5L12 7z" fill="url(#lp-g)" opacity="0.9" />
        <defs>
          <linearGradient id="lp-g" x1="3" y1="2" x2="21" y2="22">
            <stop stopColor="#8af671" />
            <stop offset="1" stopColor="#00c4ff" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">
        Lot<span className="text-ink-muted">Pilot</span>
      </span>
    </span>
  );
}
