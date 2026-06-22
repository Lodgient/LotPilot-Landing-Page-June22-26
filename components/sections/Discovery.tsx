import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";

const POINTS = [
  "Every VIN gets a machine-readable, AI-citable page that stays in sync with your feed.",
  "Structured Vehicle data — price, trim, mileage, photos, availability — that engines can actually read.",
  "AI-answer pages built around how buyers shop in your specific market.",
  "Freshness signals so sold units drop and price changes propagate fast.",
];

export default function Discovery() {
  return (
    <Section
      id="discovery"
      eyebrow="Discovery layer"
      title={
        <>
          Get found by buyers asking AI{" "}
          <span className="font-display text-gradient">which car to buy.</span>
        </>
      }
      intro="When a shopper asks an answer engine for a recommendation, your matching inventory should be the answer — routed straight back to your store, not a marketplace."
      centered={false}
    >
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <ul className="space-y-5">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs text-accent">
                  ✓
                </span>
                <span className="text-ink-soft">{p}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* mock AI chat */}
        <Reveal delay={0.1}>
          <div className="surface overflow-hidden rounded-2xl">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="ml-2 font-mono text-xs text-ink-faint">
                AI answer engine
              </span>
            </div>
            <div className="space-y-4 p-5">
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-cyan/10 px-4 py-3 text-sm text-ink-soft">
                Which dealership near me has a reliable certified SUV under $30k
                with Apple CarPlay?
              </div>
              <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-accent/30 bg-accent/[0.06] px-4 py-3 text-sm">
                <p className="text-ink-soft">
                  A great match nearby is the{" "}
                  <span className="font-semibold text-ink">2022 model</span> at{" "}
                  <span className="font-semibold text-accent">your dealership</span>{" "}
                  — certified, under budget, with Apple CarPlay.
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-line bg-base/60 p-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-accent/15 text-accent">
                    ★
                  </span>
                  <div className="text-xs">
                    <p className="font-semibold text-ink">Certified SUV · $28,400</p>
                    <p className="text-ink-faint">
                      Source: your dealership · in stock now
                    </p>
                  </div>
                  <span className="ml-auto rounded-full bg-cyan px-3 py-1 text-xs font-semibold text-ink-inverse">
                    View →
                  </span>
                </div>
              </div>
              <p className="text-center text-[11px] text-ink-faint">
                Illustrative example of a LotPilot-optimized result.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
