import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/Icon";

const ROWS: { feature: string; lp: string; mk: string }[] = [
  { feature: "Who owns the customer", lp: "You do — always", mk: "The marketplace" },
  { feature: "Resells your lead to competitors", lp: "Never", mk: "Routinely — 3+ dealers" },
  { feature: "Visible in AI answer engines", lp: "Yes — that's the point", mk: "Not your inventory" },
  { feature: "Works the lead for you (SMS + voice)", lp: "AI agent, 24/7", mk: "You do it" },
  { feature: "Captures credit applications", lp: "Built in", mk: "No" },
  { feature: "Books appointments automatically", lp: "Yes", mk: "No" },
  { feature: "Cost model", lp: "Flat — just send the feed", mk: "Per-lead + listing fees" },
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
      intro="The marketplaces put your store and three competitors on the same listing, then sell each lead more than once. LotPilot puts you in front of the buyer on your own terms — and works the lead for you."
    >
      <Reveal>
        <div className="mx-auto max-w-4xl">
          {/* Premium comparison panel — LotPilot column is the highlighted hero */}
          <div className="surface ring-gradient relative overflow-hidden rounded-3xl">
            <div className="glow-accent pointer-events-none absolute -right-24 -top-24 h-72 w-72 opacity-60" />

            {/* Highlight rail behind the LotPilot column */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-[33.333%] hidden w-[33.333%] bg-gradient-to-b from-accent/[0.06] via-cyan/[0.05] to-transparent sm:block"
            />

            <div className="relative">
              {/* Header */}
              <div className="grid grid-cols-[1.5fr_1fr] border-b border-line sm:grid-cols-[1.5fr_1fr_1fr]">
                <div className="flex items-end p-5 sm:p-6">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                    Compare
                  </span>
                </div>
                <div className="relative border-l border-line p-5 text-center sm:p-6">
                  <span className="absolute inset-x-0 top-0 mx-auto block h-px w-2/3 bg-gradient-to-r from-transparent via-accent to-transparent" />
                  <span className="inline-flex items-center gap-1.5 text-base font-bold text-gradient sm:text-lg">
                    <Icon name="sparkles" size={16} className="text-accent" />
                    LotPilot
                  </span>
                  <p className="mt-1 text-[11px] font-medium text-accent">Recommended</p>
                </div>
                <div className="hidden border-l border-line p-5 text-center sm:block sm:p-6">
                  <span className="text-sm font-semibold text-ink-muted">
                    Marketplaces
                  </span>
                  <p className="mt-1 text-[10px] text-ink-faint">{MARKETPLACES}</p>
                </div>
              </div>

              {/* Rows */}
              {ROWS.map((r, i) => (
                <div
                  key={r.feature}
                  className={`grid grid-cols-[1.5fr_1fr] items-stretch text-sm sm:grid-cols-[1.5fr_1fr_1fr] ${
                    i % 2 ? "bg-ink/[0.012]" : ""
                  }`}
                >
                  <div className="flex items-center p-5 font-medium text-ink-soft sm:p-6">
                    {r.feature}
                  </div>
                  {/* LotPilot — hero column */}
                  <div className="flex items-center gap-2.5 border-l border-line p-5 sm:justify-center sm:p-6">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
                      <Icon name="check" size={14} strokeWidth={2.5} />
                    </span>
                    <span className="sr-only">LotPilot: </span>
                    <span className="font-semibold text-ink">{r.lp}</span>
                  </div>
                  {/* Marketplaces */}
                  <div className="flex items-center gap-2.5 border-l border-line p-5 text-ink-muted sm:justify-center sm:p-6">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
                      <Icon name="close" size={14} strokeWidth={2.5} />
                    </span>
                    <span className="sr-only">Marketplaces: </span>
                    <span>
                      <span className="font-medium sm:hidden">Marketplaces: </span>
                      {r.mk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-ink-muted">
            Same buyers. <span className="font-semibold text-ink">Your store, on your terms</span> — not a bidding war on a shared listing.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
