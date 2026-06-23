import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";

const ROWS = [
  { feature: "Who owns the customer", lp: "You do", mk: "The marketplace" },
  { feature: "Resells your lead to competitors", lp: "Never", mk: "Routinely — 3+ dealers" },
  { feature: "Visible in AI answer engines", lp: "Yes — that's the point", mk: "Not your inventory" },
  { feature: "Works the lead for you (SMS + voice)", lp: "AI agent, 24/7", mk: "You do it" },
  { feature: "Captures credit applications", lp: "Built in", mk: "No" },
  { feature: "Books appointments automatically", lp: "Yes", mk: "No" },
  { feature: "Cost model", lp: "Flat — send the feed", mk: "$25k–50k+/mo + per-lead" },
];

const MARKETPLACES = "CarGurus · Cars.com · AutoTrader";

export default function Comparison() {
  return (
    <Section
      id="compare"
      glow="accent"
      glowSide="right"
      eyebrow="LotPilot vs marketplaces"
      title={
        <>
          Stop renting leads you{" "}
          <span className="font-display text-gradient">already paid for.</span>
        </>
      }
      intro="The marketplaces put your store and three competitors on the same listing. LotPilot puts you in front of the buyer on your own terms — and works the lead for you."
    >
      <Reveal>
        <div className="surface overflow-hidden rounded-2xl">
          {/* header */}
          <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-line bg-white/[0.02] text-sm">
            <div className="p-4 font-medium text-ink-muted sm:p-5">&nbsp;</div>
            <div className="border-l border-line p-4 text-center sm:p-5">
              <span className="text-base font-semibold text-gradient">LotPilot</span>
            </div>
            <div className="border-l border-line p-4 text-center sm:p-5">
              <span className="text-xs font-medium text-ink-muted sm:text-sm">
                Marketplaces
              </span>
              <p className="mt-0.5 hidden text-[10px] text-ink-faint sm:block">
                {MARKETPLACES}
              </p>
            </div>
          </div>

          {ROWS.map((r, i) => (
            <div
              key={r.feature}
              className={`grid grid-cols-[1.4fr_1fr_1fr] text-sm ${
                i % 2 ? "bg-white/[0.012]" : ""
              }`}
            >
              <div className="flex items-center p-4 text-ink-soft sm:p-5">
                {r.feature}
              </div>
              <div className="flex items-center justify-center gap-2 border-l border-line p-4 text-center sm:p-5">
                <span className="text-accent" aria-hidden="true">✓</span>
                <span className="sr-only">LotPilot: </span>
                <span className="text-ink">{r.lp}</span>
              </div>
              <div className="flex items-center justify-center gap-2 border-l border-line p-4 text-center text-ink-muted sm:p-5">
                <span className="text-danger" aria-hidden="true">✕</span>
                <span className="sr-only">Marketplaces: </span>
                <span>{r.mk}</span>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
