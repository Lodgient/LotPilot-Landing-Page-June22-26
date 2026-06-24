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

// Small brand glyph (matches the nav mark) for the winner column header.
function BrandGlyph() {
  return (
    <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#0ea5e9] shadow-[0_4px_12px_-4px_rgba(37,99,235,0.7)]">
      <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" aria-hidden="true">
        <path
          d="M11.6 2.3 21 21.2c.3.6-.3 1.3-.9 1l-7.7-3.4a1 1 0 0 0-.8 0L3.9 22.2c-.6.3-1.2-.4-.9-1L10.4 2.3a.65.65 0 0 1 1.2 0Z"
          fill="#ffffff"
        />
      </svg>
    </span>
  );
}

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
        <div className="relative mx-auto max-w-4xl">
          {/* The winner column, raised out of the table as its own card. Aligned
              to the [1.5fr_1fr_1fr] grid: left = 1.5/3.5, width = 1/3.5. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-5 bottom-0 left-[42.857%] z-0 hidden w-[28.571%] rounded-2xl bg-gradient-to-b from-white to-cyan/[0.05] shadow-[0_34px_80px_-30px_rgba(37,99,235,0.5)] ring-1 ring-cyan/35 sm:block"
          >
            <span className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-cyan via-accent to-violet" />
          </div>

          {/* Table frame — transparent so the raised card shows through */}
          <div className="relative z-10 overflow-visible rounded-3xl border border-line">
            {/* Header */}
            <div className="grid grid-cols-[1.4fr_1fr] sm:grid-cols-[1.5fr_1fr_1fr]">
              <div className="flex items-end border-b border-line p-5 sm:p-6">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                  Compare
                </span>
              </div>
              <div className="relative p-5 pt-6 text-center sm:p-6 sm:pt-7">
                <span className="inline-flex items-center gap-2">
                  <BrandGlyph />
                  <span className="text-lg font-bold tracking-[-0.01em] text-ink">LotPilot</span>
                </span>
                <p className="mt-2">
                  <span className="inline-block rounded-full bg-cyan/12 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan ring-1 ring-inset ring-cyan/25">
                    Recommended
                  </span>
                </p>
              </div>
              <div className="hidden border-b border-l border-line p-5 text-center sm:block sm:p-6">
                <span className="text-sm font-semibold text-ink-muted">Marketplaces</span>
                <p className="mt-1 text-[10px] text-ink-faint">{MARKETPLACES}</p>
              </div>
            </div>

            {/* Rows — separators only on the outer columns so the winner column reads as continuous */}
            {ROWS.map((r) => (
              <div
                key={r.feature}
                className="grid grid-cols-[1.4fr_1fr] items-stretch text-sm sm:grid-cols-[1.5fr_1fr_1fr]"
              >
                <div className="flex items-center border-t border-line p-5 font-medium text-ink-soft sm:p-6">
                  {r.feature}
                </div>
                {/* LotPilot — winner column (no horizontal rule; the raised card carries it) */}
                <div className="relative z-10 flex items-center gap-2.5 p-5 sm:justify-center sm:p-6">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan text-white shadow-[0_2px_8px_-2px_rgba(37,99,235,0.7)]">
                    <Icon name="check" size={13} strokeWidth={3} />
                  </span>
                  <span className="sr-only">LotPilot: </span>
                  <span className="font-semibold text-ink">{r.lp}</span>
                </div>
                {/* Marketplaces — recessed */}
                <div className="flex items-center gap-2.5 border-t border-l border-line p-5 text-ink-muted sm:justify-center sm:p-6">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-danger/10 text-danger">
                    <Icon name="close" size={13} strokeWidth={2.5} />
                  </span>
                  <span className="sr-only">Marketplaces: </span>
                  <span>
                    <span className="font-medium text-ink-soft sm:hidden">Marketplaces: </span>
                    {r.mk}
                  </span>
                </div>
              </div>
            ))}

            {/* rounded base under the winner card */}
            <div className="h-3" />
          </div>

          <p className="mt-7 text-center text-sm text-ink-muted">
            Same buyers.{" "}
            <span className="font-semibold text-ink">Your store, on your terms</span> — not a bidding
            war on a shared listing.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
