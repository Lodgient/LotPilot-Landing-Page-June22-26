import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Icon, { type IconName } from "@/components/Icon";

// Concrete, dealer-language benefits we track on the launch pilot — paired with
// the two-job framing. We never invent metrics; verified numbers replace the
// status line as the pilot reports. (CLAUDE CODE BRIEF §8/§9.)
const TRACKED: { icon: IconName; label: string; sub: string }[] = [
  { icon: "radar", label: "Getting cited when buyers ask AI", sub: "AI visibility" },
  { icon: "bolt", label: "First reply in seconds, 24/7", sub: "Speed-to-lead" },
  { icon: "file", label: "Deals arrive pre-started", sub: "Credit apps captured" },
];

export default function Proof() {
  return (
    <Section
      glow="violet"
      tinted
      eyebrow="Early access"
      title={
        <>
          Get in while AI search is{" "}
          <span className="font-display text-gradient">still wide open.</span>
        </>
      }
      intro="Almost no dealer is optimized for how buyers shop now — asking AI what to buy. The first store in a market to get cited owns those buyers; everyone else stays invisible. We're live with our launch store, tracking it in the open — and when we publish numbers, they'll be verified, never the fiction other vendors put on a slide."
    >
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <div className="surface surface-hover rounded-2xl p-6 sm:p-8">
            {/* dealer header */}
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-black/[0.04] font-display text-xl text-gradient ring-1 ring-line-strong">
                C
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-ink">Capitol Nissan Infiniti</h3>
                <p className="text-xs text-ink-muted">Franchise dealer · launch pilot · San Jose, CA</p>
              </div>
              <div className="ml-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs">
                <span className="inline-flex items-center gap-1.5 text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Feed connected
                </span>
                <span className="inline-flex items-center gap-1.5 text-cyan">
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-cyan" /> AI agent live
                </span>
              </div>
            </div>

            {/* what we're proving — in dealer language */}
            <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
              {TRACKED.map((t) => (
                <div key={t.sub} className="rounded-xl border border-line bg-black/[0.02] p-3.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan/10 text-cyan ring-1 ring-inset ring-cyan/20">
                    <Icon name={t.icon} size={18} />
                  </span>
                  <p className="mt-3 text-sm font-medium leading-snug text-ink">{t.label}</p>
                  <p className="mt-1 text-[11px] font-mono uppercase tracking-wider text-ink-faint">
                    {t.sub}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-5 flex items-center gap-2 text-xs text-ink-muted">
              <Icon name="shield" size={14} className="shrink-0 text-accent" />
              Verified results post at 30 / 60 / 90 days. Real numbers — or none.
            </p>
          </div>
        </Reveal>

        {/* next-mover CTA */}
        <Reveal delay={0.08}>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
            <a
              href="#audit"
              className="inline-flex h-12 items-center rounded-full bg-cyan px-6 text-sm font-semibold text-ink-inverse transition-all hover:-translate-y-0.5 hover:bg-cyan-dim cta-glow"
            >
              See if AI can find your inventory →
            </a>
            <a
              href="/dashboard"
              className="text-sm text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              or click through the live demo →
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
