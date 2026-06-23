import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Icon, { type IconName } from "@/components/Icon";

const POINTS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "file",
    title: "A citable page for every VIN",
    body: "Machine-readable vehicle pages that stay in sync with your feed, so engines can quote them directly.",
  },
  {
    icon: "command",
    title: "Structured vehicle data",
    body: "Price, trim, mileage, photos and availability modeled the way answer engines actually read.",
  },
  {
    icon: "target",
    title: "Answers built for your market",
    body: "Pages shaped around how buyers in your area shop — so you match the questions they ask.",
  },
  {
    icon: "bolt",
    title: "Freshness signals",
    body: "Sold units drop and price changes propagate fast, so AI never recommends a car you don't have.",
  },
];

const ENGINES = ["ChatGPT", "Perplexity", "Gemini"];

export default function Discovery() {
  return (
    <Section
      id="discovery"
      glow="violet"
      glowSide="right"
      eyebrow="Get found by AI"
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
          <ul className="space-y-4">
            {POINTS.map((p) => (
              <li
                key={p.title}
                className="surface surface-hover flex gap-4 rounded-2xl p-4"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent ring-1 ring-accent/25">
                  <Icon name={p.icon} size={20} strokeWidth={2} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{p.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* mock AI answer-engine result */}
        <Reveal delay={0.1}>
          <div className="relative">
            <div className="glow-violet pointer-events-none absolute -inset-6 -z-10 opacity-50" />
            <div className="surface overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
              {/* engine chrome */}
              <div className="flex items-center gap-3 border-b border-line bg-canvas-2/60 px-4 py-3">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan/12 text-cyan ring-1 ring-cyan/25">
                  <Icon name="sparkles" size={15} strokeWidth={2} />
                </span>
                <div className="flex items-center gap-1.5">
                  {ENGINES.map((e, i) => (
                    <span
                      key={e}
                      className={
                        i === 0
                          ? "rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink shadow-sm ring-1 ring-line"
                          : "rounded-full px-2.5 py-1 text-[11px] font-medium text-ink-faint"
                      }
                    >
                      {e}
                    </span>
                  ))}
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-ink-faint">
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
                  Live answer
                </span>
              </div>

              <div className="space-y-4 p-5">
                {/* buyer prompt */}
                <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-sm bg-cyan/10 px-4 py-3 text-sm text-ink-soft ring-1 ring-cyan/15">
                  Which dealership near me has a reliable certified SUV under $30k
                  with Apple CarPlay?
                </div>

                {/* AI answer */}
                <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-line bg-white px-4 py-3.5 text-sm shadow-sm">
                  <p className="leading-relaxed text-ink-soft">
                    A great match nearby is the{" "}
                    <span className="font-semibold text-ink">
                      2022 Certified SUV
                    </span>{" "}
                    at{" "}
                    <span className="font-semibold text-accent">your dealership</span>
                    <sup className="ml-0.5 rounded bg-accent/12 px-1 py-0.5 text-[10px] font-semibold text-accent">
                      1
                    </sup>{" "}
                    — certified, under budget, and equipped with Apple CarPlay.
                  </p>

                  {/* cited VDP card */}
                  <div className="mt-3.5 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/[0.05] p-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-accent ring-1 ring-accent/25 shadow-sm">
                      <Icon name="car" size={22} strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        2022 Certified SUV · $28,400
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-faint">
                        <Icon name="check" size={12} strokeWidth={2.5} className="text-accent" />
                        In stock · CarPlay · Source: Your VDP
                      </p>
                    </div>
                    <span className="ml-auto inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-cyan px-3 text-xs font-semibold text-ink-inverse shadow-sm">
                      View
                      <Icon name="arrow-right" size={13} strokeWidth={2.5} />
                    </span>
                  </div>

                  {/* citation footnote */}
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-faint">
                    <Icon name="link" size={12} strokeWidth={2} />
                    <span className="font-medium text-ink-muted">1.</span>
                    yourdealership.com/inventory/2022-certified-suv
                  </p>
                </div>

                <p className="text-center text-[11px] text-ink-faint">
                  Illustrative example of a LotPilot-optimized result.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
