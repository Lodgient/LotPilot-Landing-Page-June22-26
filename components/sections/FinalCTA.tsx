import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/Icon";
import type { IconName } from "@/components/Icon";

const TRUST: { icon: IconName; label: string }[] = [
  { icon: "check", label: "No credit card" },
  { icon: "shield", label: "No reselling your leads" },
  { icon: "car", label: "You own every customer" },
];

export default function FinalCTA() {
  return (
    <section id="demo" className="relative overflow-hidden py-24 sm:py-32">
      <div className="bg-grid pointer-events-none absolute inset-0 rotate-180" />
      <div className="glow-accent drift-slow pointer-events-none absolute left-1/2 top-0 h-[460px] w-[460px] -translate-x-1/2" />
      <div className="glow-cyan pointer-events-none absolute left-1/2 top-24 h-[360px] w-[520px] -translate-x-1/2 opacity-60" />

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white px-4 py-1.5 text-xs font-medium text-ink-soft shadow-sm">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-cyan" />
            Two minutes to start
          </span>

          <h2 className="mt-7 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            See where you stand with AI —{" "}
            <span className="font-display font-normal text-gradient">
              then let us fix it.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-ink-muted sm:text-lg">
            Run the free audit, or book a demo and connect your feed. From there,
            LotPilot handles discovery and works your leads. You just send the feed.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#audit"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-cyan px-8 text-base font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow sm:w-auto"
            >
              Run the free AI audit
              <Icon name="arrow-right" size={18} />
            </a>
            <a
              href="#feed"
              className="inline-flex h-14 w-full items-center justify-center rounded-full border border-line-strong bg-white px-8 text-base font-semibold text-ink shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan/50 sm:w-auto"
            >
              Connect your feed / book a demo
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-ink-muted">
            {TRUST.map((t) => (
              <span key={t.label} className="inline-flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/12 text-accent">
                  <Icon name={t.icon} size={12} strokeWidth={2.5} />
                </span>
                {t.label}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
