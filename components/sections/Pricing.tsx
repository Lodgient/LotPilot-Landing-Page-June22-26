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

const RAMP: { tone: "cyan" | "accent" | "violet"; month: string; title: string; body: string }[] = [
  {
    tone: "cyan",
    month: "Month 1",
    title: "Foundation",
    body: "We connect your feed and make every vehicle AI-readable. Your AI agent starts answering and booking leads on day one.",
  },
  {
    tone: "accent",
    month: "Month 2",
    title: "Momentum",
    body: "AI engines re-crawl and begin citing your inventory. Your visibility score climbs and answers start naming your store.",
  },
  {
    tone: "violet",
    month: "Month 3",
    title: "Compounding",
    body: "You surface across ChatGPT, Perplexity, Gemini and Google AI Overviews in your market — leads, appointments and booked deals build on each other.",
  },
];

const TONE: Record<string, string> = {
  cyan: "bg-cyan/12 text-cyan ring-cyan/30",
  accent: "bg-accent/12 text-accent ring-accent/30",
  violet: "bg-violet/15 text-violet ring-violet/30",
};

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
      intro="AI visibility compounds like SEO — it builds over your first ~90 days. So you start with a flat 3-month launch program while your AI agent works every lead from day one. No per-lead fees, no reselling, you own every customer."
    >
      <Reveal>
        <div className="mx-auto max-w-3xl">
          <div className="surface ring-gradient relative overflow-hidden rounded-3xl p-8 sm:p-10">
            <div className="glow-cyan pointer-events-none absolute -right-24 -top-24 h-72 w-72 opacity-70" />

            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              {/* Left — the offer */}
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/[0.06] px-3 py-1 text-xs font-medium text-cyan">
                  <Icon name="bolt" size={13} />
                  Founding-dealer launch program
                </span>

                <div className="mt-6 flex items-end gap-2.5">
                  <span className="font-display text-6xl leading-none text-ink sm:text-7xl">
                    $499
                  </span>
                  <span className="pb-1.5 text-lg font-medium text-ink-muted">/mo</span>
                  <span className="mb-2 ml-1 rounded-full bg-cyan/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan">
                    First 3 months
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">
                  Everything included — Discovery + Conversion
                </p>

                {/* transparent after-price — no bait-and-switch */}
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-line-strong bg-black/[0.02] px-4 py-3">
                  <Icon
                    name="check"
                    size={16}
                    strokeWidth={2.5}
                    className="mt-0.5 shrink-0 text-accent"
                  />
                  <p className="text-sm text-ink-soft">
                    Then <span className="font-semibold text-ink">$999/mo</span>,
                    month-to-month —{" "}
                    <span className="font-medium text-cyan">
                      founding rate, locked for life
                    </span>{" "}
                    (standard rate $1,499). Cancel anytime.
                  </p>
                </div>

                <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
                  AI search rewards the stores that show up consistently — exactly
                  like Google SEO did. LotPilot compounds in about 90 days instead
                  of a year, with the AI agent booking your leads the whole time. By
                  month three you&apos;ll have real results in hand — and $999/mo is
                  less than a single marketplace subscription, and a fraction of one
                  BDC hire.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#demo"
                    className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-cyan px-7 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow"
                  >
                    Start your 3 months
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
                  Built for franchise + independent dealers. Cancel anytime after the launch program.
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

      {/* ---------- the ramp: framed like SEO, but faster ---------- */}
      <Reveal delay={0.1}>
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="flex items-center justify-center gap-2.5 text-center">
            <Icon name="trending" size={16} className="text-cyan" />
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">
              What to expect — think SEO, but it compounds in ~90 days
            </p>
          </div>

          <div className="relative mt-7">
            {/* connecting rail */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-cyan/40 via-accent/40 to-violet/40 md:block"
            />
            <div className="grid gap-4 md:grid-cols-3">
              {RAMP.map((r) => (
                <div
                  key={r.month}
                  className="surface relative flex h-full flex-col rounded-2xl p-6"
                >
                  <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-wider ring-1 ${TONE[r.tone]}`}
                  >
                    {r.month}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{r.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SEO vs LotPilot contrast */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-danger/25 bg-danger/[0.05] p-5">
              <p className="text-xs font-mono uppercase tracking-wider text-danger">
                Traditional SEO + marketplaces
              </p>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                <li className="flex gap-2.5"><span className="mt-0.5 text-danger">✕</span> 6–12 months to rank — and buyers are skipping Google for AI</li>
                <li className="flex gap-2.5"><span className="mt-0.5 text-danger">✕</span> You still pay marketplaces a per-lead toll</li>
                <li className="flex gap-2.5"><span className="mt-0.5 text-danger">✕</span> The same lead is resold to your competitors</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-accent/30 bg-accent/[0.07] p-5">
              <p className="text-xs font-mono uppercase tracking-wider text-accent">
                LotPilot
              </p>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                <li className="flex gap-2.5"><Icon name="check" size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-accent" /> ~90 days to compound in AI answers — where buyers actually ask now</li>
                <li className="flex gap-2.5"><Icon name="check" size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-accent" /> $499/mo to launch, then a flat $999 founding rate — no per-lead meter, no surprises</li>
                <li className="flex gap-2.5"><Icon name="check" size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-accent" /> The AI agent works your leads from day one — and you own every customer</li>
              </ul>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-ink-faint">
            AI search is brand-new, so visibility builds over your first few months — exactly like early SEO did. Getting in now is the advantage: the dealers who show up first become the answer buyers see.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
