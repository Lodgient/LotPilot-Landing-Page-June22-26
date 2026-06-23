import Reveal from "@/components/ui/Reveal";

export default function FinalCTA() {
  return (
    <section id="demo" className="relative overflow-hidden py-24 sm:py-32">
      <div className="bg-grid pointer-events-none absolute inset-0 rotate-180" />
      <div className="glow-accent pointer-events-none absolute left-1/2 top-0 h-[460px] w-[460px] -translate-x-1/2" />

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-black/[0.03] px-4 py-1.5 text-xs text-ink-soft">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-cyan" />
            Two minutes to start
          </span>
          <h2 className="mt-6 text-balance text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            See where you stand with AI —{" "}
            <span className="font-display text-gradient">then let us fix it.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-ink-muted sm:text-lg">
            Run the free audit, or book a demo and connect your feed. From there,
            LotPilot handles discovery and works your leads. You just send the feed.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#audit"
              className="inline-flex h-14 w-full items-center justify-center rounded-full bg-cyan px-8 text-base font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan/90 cta-glow sm:w-auto"
            >
              Run the free AI audit →
            </a>
            <a
              href="#feed"
              className="inline-flex h-14 w-full items-center justify-center rounded-full border border-line-strong px-8 text-base font-medium text-ink transition-colors hover:border-cyan/50 hover:bg-black/[0.04] sm:w-auto"
            >
              Connect your feed / book a demo
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-faint">
            <span className="inline-flex items-center gap-1.5"><span className="text-accent">✓</span> No credit card</span>
            <span className="inline-flex items-center gap-1.5"><span className="text-accent">✓</span> No reselling your leads</span>
            <span className="inline-flex items-center gap-1.5"><span className="text-accent">✓</span> You own every customer</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
