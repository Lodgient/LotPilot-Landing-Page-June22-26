import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";

const PAINS = [
  {
    stat: "$25k–50k+/mo",
    title: "You rent your leads",
    body: "CarGurus, Cars.com and AutoTrader take five and six figures a year — then resell the same shopper to three of your competitors.",
  },
  {
    stat: "New front door",
    title: "Buyers ask AI first",
    body: "Shoppers now open ChatGPT, Perplexity and Google AI Overviews and ask which car to buy. That answer decides where they go next.",
  },
  {
    stat: "Not you",
    title: "AI sends them elsewhere",
    body: "Those engines cite marketplaces and the dealer down the road — not your store — even when you have the exact car in stock.",
  },
];

export default function Problem() {
  return (
    <Section
      id="problem"
      glow="violet"
      glowSide="right"
      eyebrow="The shift nobody told your store about"
      title={
        <>
          The buyer&apos;s first question now goes to{" "}
          <span className="font-display text-gradient">an AI</span> — and the
          answer isn&apos;t you.
        </>
      }
      intro="You already pay to be found. But the channel that's growing fastest doesn't show your inventory at all — it shows the marketplaces you're trying to escape."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {PAINS.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08}>
            <div className="surface surface-hover h-full rounded-2xl p-6">
              <p className="inline-flex rounded-md bg-danger/12 px-2 py-1 font-mono text-sm text-danger">{p.stat}</p>
              <h3 className="mt-3 text-lg font-semibold text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-canvas-2 p-6 sm:p-8">
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
            <div className="text-center sm:text-right">
              <p className="text-xs uppercase tracking-wider text-ink-faint">
                A real shopper, today
              </p>
              <p className="mt-2 font-display text-xl text-ink-soft">
                &ldquo;Best certified used SUV under $30k near me?&rdquo;
              </p>
            </div>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-line-strong text-ink-muted">
              →
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-wider text-ink-faint">
                What the AI answers
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                <span className="rounded bg-danger/15 px-1.5 py-0.5 text-danger">
                  Carvana
                </span>
                ,{" "}
                <span className="rounded bg-danger/15 px-1.5 py-0.5 text-danger">
                  CarGurus
                </span>
                , and a competing dealer.{" "}
                <span className="text-ink-muted">Your matching unit? Not mentioned.</span>
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
