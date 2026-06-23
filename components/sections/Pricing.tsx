import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/Icon";
import type { IconName } from "@/components/Icon";

const INCLUDED: { icon: IconName; label: string }[] = [
  { icon: "radar", label: "AI-visibility for your full inventory" },
  { icon: "messages", label: "AI SMS + voice agent working every lead" },
  { icon: "file", label: "Credit application capture" },
  { icon: "calendar", label: "Appointment booking + deal progression" },
  { icon: "globe", label: "Multi-rooftop support" },
  { icon: "shield", label: "You own every customer — no reselling" },
];

export default function Pricing() {
  return (
    <Section
      id="pricing"
      glow="accent"
      tinted
      eyebrow="Pricing"
      title={
        <>
          One flat partner.{" "}
          <span className="font-display text-gradient">Not a per-lead toll.</span>
        </>
      }
      intro="Unlike marketplaces that bill per lead and resell each one, LotPilot is a single flat engagement. We size it to your store and market on a short call — no per-lead meter, no surprises."
    >
      <Reveal>
        <div className="mx-auto max-w-3xl">
          <div className="surface ring-gradient relative overflow-hidden rounded-3xl p-8 sm:p-10">
            <div className="glow-cyan pointer-events-none absolute -right-24 -top-24 h-72 w-72 opacity-70" />

            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              {/* Left — the pitch */}
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/[0.06] px-3 py-1 text-xs font-medium text-cyan">
                  <Icon name="bolt" size={13} />
                  Discovery + Conversion, included
                </span>

                <div className="mt-6 flex items-end gap-2.5">
                  <span className="font-display text-5xl leading-none text-ink sm:text-6xl">
                    Flat-rate
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-ink-muted">
                  Scoped to your store — quoted on the call.
                </p>

                <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
                  No per-lead fees. No marketplace toll. No long lock-in to find
                  out if it works — we start with your free AI audit, then a
                  pilot on your real inventory.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#demo"
                    className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-cyan px-7 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow"
                  >
                    Book a demo for pricing
                    <Icon name="arrow-right" size={16} />
                  </a>
                  <a
                    href="#audit"
                    className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-line-strong bg-white px-7 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-cyan/50"
                  >
                    Run the free audit
                  </a>
                </div>

                <p className="mt-5 flex items-center gap-2 text-xs text-ink-faint">
                  <Icon name="shield" size={14} className="text-accent" />
                  Built for franchise + independent dealers. Cancel anytime.
                </p>
              </div>

              {/* Right — what's included */}
              <div className="rounded-2xl border border-line bg-canvas-2/70 p-6 sm:p-7">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                  Every plan includes
                </p>
                <ul className="mt-5 space-y-3.5">
                  {INCLUDED.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-start gap-3 text-sm text-ink-soft"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
                        <Icon name="check" size={13} strokeWidth={2.5} />
                      </span>
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
