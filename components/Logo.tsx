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
      {/* A crisp electric-blue tile with a white navigation glyph — one mark that
          reads on both the dark hero and white surfaces, and nods to "Pilot"
          (navigation) + being pointed to by AI. */}
      <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#0ea5e9] shadow-[0_8px_22px_-8px_rgba(37,99,235,0.75)] ring-1 ring-white/20">
        {/* glossy top highlight for depth */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.3),transparent)]" />
        <svg
          viewBox="0 0 24 24"
          className="relative h-[23px] w-[23px] drop-shadow-[0_1px_1px_rgba(8,12,20,0.35)]"
          aria-hidden="true"
        >
          <path d="M11.6 2.3 21 21.2c.3.6-.3 1.3-.9 1l-7.7-3.4a1 1 0 0 0-.8 0L3.9 22.2c-.6.3-1.2-.4-.9-1L10.4 2.3a.65.65 0 0 1 1.2 0Z" fill="#ffffff" />
        </svg>
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
