import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Connect your feed",
    body: "Send the inventory export you already produce — vAuto, HomeNet, Dealer.com, DealerSocket, CSV or XML. That's the entire setup. No new software for your team.",
    tag: "Your only lift",
    tagColor: "text-cyan",
  },
  {
    n: "02",
    title: "We make every vehicle AI-discoverable",
    body: "LotPilot structures, publishes and keeps your inventory fresh in the formats AI answer engines read and cite — so your cars start showing up when buyers ask.",
    tag: "Get found by AI",
    tagColor: "text-accent",
  },
  {
    n: "03",
    title: "Our AI agent works the leads",
    body: "Every inbound is answered in seconds over SMS and voice. The agent qualifies the buyer, captures the credit application, books the appointment and pushes the deal forward — 24/7.",
    tag: "Win the lead",
    tagColor: "text-accent",
  },
];

export default function HowItWorks() {
  return (
    <Section
      id="how"
      glow="accent"
      glowSide="left"
      eyebrow="How LotPilot works"
      title={
        <>
          Three steps. <span className="font-display text-gradient">One of them is yours.</span>
        </>
      }
      intro="The dealer's job ends at the feed. Everything downstream — visibility, answers, follow-up, credit, booking — runs on LotPilot."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.1}>
            <div className="surface surface-hover relative h-full overflow-hidden rounded-2xl p-7">
              <span className="font-display text-6xl text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.14)]">
                {s.n}
              </span>
              <p className={`mt-2 text-xs font-mono uppercase tracking-wider ${s.tagColor}`}>
                {s.tag}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-ink">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.body}</p>
              {i < STEPS.length - 1 && (
                <span className="pointer-events-none absolute -right-3 top-1/2 hidden -translate-y-1/2 text-2xl text-line-strong md:block">
                  →
                </span>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
