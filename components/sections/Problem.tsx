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
    <section
      id="problem"
      className="relative overflow-hidden bg-[#0a0b0d] py-24 text-[#ece3cf] sm:py-32"
    >
      {/* ambient + fade into the light sections below */}
      <div className="glow-violet drift-slow pointer-events-none absolute -right-[8%] top-10 h-[520px] w-[520px] opacity-25" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto mb-14 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-mono uppercase tracking-[0.2em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px] shadow-accent" />
            The shift nobody told your store about
          </span>
          <h2 className="mt-5 text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
            The buyer&apos;s first question now goes to{" "}
            <span className="font-display bg-gradient-to-r from-accent via-cyan to-violet bg-clip-text text-transparent">
              an AI
            </span>{" "}
            — and the answer isn&apos;t you.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-[#ece3cf]/70 sm:text-lg">
            You already pay to be found. But the channel that&apos;s growing fastest doesn&apos;t
            show your inventory at all — it shows the marketplaces you&apos;re trying to escape.
          </p>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {PAINS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors hover:border-white/20">
                <p className="inline-flex rounded-md bg-danger/15 px-2 py-1 font-mono text-sm text-danger">
                  {p.stat}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-[#ece3cf]">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#ece3cf]/70">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8">
            <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
              <div className="text-center sm:text-right">
                <p className="text-xs uppercase tracking-wider text-[#ece3cf]/45">A real shopper, today</p>
                <p className="mt-2 font-display text-xl text-[#ece3cf]/90">
                  &ldquo;Best certified used SUV under $30k near me?&rdquo;
                </p>
              </div>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/20 text-[#ece3cf]/70">
                →
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs uppercase tracking-wider text-[#ece3cf]/45">What the AI answers</p>
                <p className="mt-2 text-sm text-[#ece3cf]/80">
                  <span className="rounded bg-danger/20 px-1.5 py-0.5 text-danger">Carvana</span>,{" "}
                  <span className="rounded bg-danger/20 px-1.5 py-0.5 text-danger">CarGurus</span>, and a
                  competing dealer.{" "}
                  <span className="text-[#ece3cf]/55">Your matching unit? Not mentioned.</span>
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
