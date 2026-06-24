import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/Icon";
import type { IconName } from "@/components/Icon";
import CheckoutButton from "@/components/CheckoutButton";

const DISCOVERY: { icon: IconName; label: string }[] = [
  { icon: "radar", label: "An AI-searchable page for every VIN — schema.org + llms.txt" },
  { icon: "sparkles", label: "Visibility monitor across ChatGPT, Grok, Perplexity, Gemini & Claude" },
  { icon: "target", label: "Competitor & share-of-voice tracking" },
  { icon: "trending", label: "Thousands of buyer-query tests, run continuously" },
  { icon: "chart", label: "Board-ready monthly report" },
  { icon: "globe", label: "Multi-rooftop support" },
];

const CONVERSION: { icon: IconName; label: string }[] = [
  { icon: "bolt", label: "AI SMS + voice agent — replies in seconds, 24/7" },
  { icon: "search", label: "Qualifies budget, trade, timeline & financing" },
  { icon: "file", label: "Credit application capture" },
  { icon: "calendar", label: "Appointment booking + deal progression" },
  { icon: "shield", label: "You own every customer — no reselling" },
];

const RAMP: { tone: "cyan" | "accent" | "violet"; month: string; title: string; body: string }[] = [
  { tone: "cyan", month: "Month 1", title: "Foundation", body: "We connect your feed and rebuild every vehicle as an AI-readable page. You start showing up where buyers ask." },
  { tone: "accent", month: "Month 2", title: "Momentum", body: "AI engines re-crawl and begin citing your inventory. Your visibility score climbs and answers start naming your store." },
  { tone: "violet", month: "Month 3", title: "Compounding", body: "You surface across ChatGPT, Grok, Perplexity, Gemini and Claude in your market — and the gap on competitors widens every week." },
];

const TONE: Record<string, string> = {
  cyan: "bg-cyan/12 text-cyan ring-cyan/30",
  accent: "bg-accent/12 text-accent ring-accent/30",
  violet: "bg-violet/15 text-violet ring-violet/30",
};

function FeatureList({ items }: { items: { icon: IconName; label: string }[] }) {
  return (
    <ul className="mt-6 space-y-3.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-start gap-3 text-sm text-ink-soft">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
            <Icon name="check" size={13} strokeWidth={2.5} />
          </span>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Pricing() {
  return (
    <Section
      id="pricing"
      glow="accent"
      tinted
      eyebrow="Pricing"
      title={
        <>
          Priced so <span className="font-display text-gradient">every rooftop</span> can start.
        </>
      }
      intro="Start with AI Visibility — the part every dealer needs. Add the AI Sales Agent when you're ready to work the leads. Founding rates lock for life, and visibility compounds like SEO — in about 90 days, not a year. No per-lead fees, no reselling: you own every customer."
    >
      <Reveal>
        <div className="mx-auto grid max-w-4xl items-stretch gap-6 lg:grid-cols-2">
          {/* Base — AI Visibility */}
          <div className="surface ring-gradient relative flex flex-col overflow-hidden rounded-3xl p-7 sm:p-8">
            <div className="glow-cyan pointer-events-none absolute -right-20 -top-20 h-56 w-56 opacity-70" />
            <div className="relative flex flex-1 flex-col">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan/30 bg-cyan/[0.06] px-3 py-1 text-xs font-medium text-cyan">
                <Icon name="radar" size={13} />
                Get found by AI · every dealer needs this
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">AI Visibility</h3>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-display text-5xl leading-none text-ink sm:text-6xl">$399</span>
                <span className="pb-1.5 text-base font-medium text-ink-muted">/mo</span>
              </div>
              <p className="mt-2 text-xs text-ink-faint">
                <span className="font-medium text-cyan">Founding rate, locked for life</span> · standard
                $599 · cancel anytime
              </p>

              <FeatureList items={DISCOVERY} />

              <div className="mt-auto flex flex-col items-center gap-3 pt-8">
                <CheckoutButton
                  plans={["visibility"]}
                  className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-cyan px-7 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow disabled:opacity-70"
                >
                  Start AI Visibility
                  <Icon name="arrow-right" size={16} />
                </CheckoutButton>
                <a
                  href="/#audit"
                  className="text-xs font-medium text-ink-muted transition-colors hover:text-cyan"
                >
                  Or run the free 60-second check first →
                </a>
              </div>
            </div>
          </div>

          {/* Add-on — AI Sales Agent */}
          <div className="surface relative flex flex-col overflow-hidden rounded-3xl border-line-strong p-7 sm:p-8">
            <div className="relative flex flex-1 flex-col">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-violet/30 bg-violet/[0.08] px-3 py-1 text-xs font-medium text-violet">
                <Icon name="messages" size={13} />
                Win the lead · optional add-on
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">AI Sales Agent</h3>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-display text-5xl leading-none text-ink sm:text-6xl">+$699</span>
                <span className="pb-1.5 text-base font-medium text-ink-muted">/mo</span>
              </div>
              <p className="mt-2 text-xs text-ink-faint">
                Add to AI Visibility anytime · replaces a BDC seat at a fraction of the cost
              </p>

              <FeatureList items={CONVERSION} />

              <div className="mt-auto flex flex-col items-center gap-3 pt-8">
                <a
                  href="/dashboard/assistant"
                  className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-full border border-violet/40 bg-violet/10 px-7 text-sm font-semibold text-violet transition-all hover:-translate-y-0.5 hover:bg-violet/15"
                >
                  See the agent work
                  <Icon name="arrow-right" size={16} />
                </a>
                <p className="text-xs text-ink-faint">Add it once the leads start coming in.</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* the ramp: framed like SEO, but faster */}
      <Reveal delay={0.1}>
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="flex items-center justify-center gap-2.5 text-center">
            <Icon name="trending" size={16} className="text-cyan" />
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">
              What to expect — think SEO, but it compounds in ~90 days
            </p>
          </div>

          <div className="relative mt-7">
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-cyan/40 via-accent/40 to-violet/40 md:block"
            />
            <div className="grid gap-4 md:grid-cols-3">
              {RAMP.map((r) => (
                <div key={r.month} className="surface relative flex h-full flex-col rounded-2xl p-6">
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
              <p className="text-xs font-mono uppercase tracking-wider text-accent">LotPilot</p>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                <li className="flex gap-2.5"><Icon name="check" size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-accent" /> ~90 days to compound in AI answers — where buyers actually ask now</li>
                <li className="flex gap-2.5"><Icon name="check" size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-accent" /> From $399/mo — no per-lead meter, no surprises</li>
                <li className="flex gap-2.5"><Icon name="check" size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-accent" /> Add the AI agent (+$699) when you want every lead worked — you own every customer</li>
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
