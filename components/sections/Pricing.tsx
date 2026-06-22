import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";

const INCLUDED = [
  "AI-visibility for your full inventory",
  "AI SMS + voice agent working every lead",
  "Credit application capture",
  "Appointment booking + deal progression",
  "Multi-rooftop support",
  "You own every customer — no reselling",
];

export default function Pricing() {
  return (
    <Section
      id="pricing"
      eyebrow="Pricing"
      title={
        <>
          One flat partner.{" "}
          <span className="font-display text-gradient">Not a per-lead toll.</span>
        </>
      }
      intro="Unlike marketplaces that bill per lead and resell each one, LotPilot is a flat engagement. We'll size it to your store and market on a short call."
    >
      <Reveal>
        <div className="mx-auto max-w-2xl">
          <div className="surface relative overflow-hidden rounded-2xl p-8 sm:p-10">
            <div className="glow-cyan pointer-events-none absolute -right-20 -top-20 h-64 w-64" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/[0.06] px-3 py-1 text-xs font-medium text-cyan">
                Discovery + Conversion, included
              </span>
              <div className="mt-5 flex items-end gap-2">
                <span className="font-display text-4xl text-ink sm:text-5xl">
                  Flat-rate
                </span>
                <span className="pb-1.5 text-sm text-ink-muted">
                  / scoped to your store
                </span>
              </div>
              <p className="mt-3 text-sm text-ink-muted">
                No per-lead fees. No long-term lock to find out if it works — we
                start with your audit and a pilot.
              </p>

              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {INCLUDED.map((t) => (
                  <li key={t} className="flex gap-2.5 text-sm text-ink-soft">
                    <span className="text-accent">✓</span>
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#demo"
                  className="inline-flex h-13 flex-1 items-center justify-center rounded-full bg-cyan px-7 py-4 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan/90 cta-glow"
                >
                  Book a demo for pricing →
                </a>
                <a
                  href="#audit"
                  className="inline-flex h-13 flex-1 items-center justify-center rounded-full border border-line-strong px-7 py-4 text-sm font-medium text-ink transition-colors hover:border-cyan/50 hover:bg-white/[0.04]"
                >
                  Run the free audit first
                </a>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
