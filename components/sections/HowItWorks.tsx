import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Icon, { type IconName } from "@/components/Icon";

type Tone = "cyan" | "accent" | "violet";

const STEPS: {
  n: string;
  icon: IconName;
  title: string;
  body: string;
  tag: string;
  tone: Tone;
  meta: string;
}[] = [
  {
    n: "01",
    icon: "link",
    title: "Connect your feed",
    body: "Send the inventory export you already produce — vAuto, HomeNet, Dealer.com, DealerSocket, CSV or XML. That's the entire setup. No new software for your team.",
    tag: "Your only lift",
    tone: "cyan",
    meta: "~5 min, one time",
  },
  {
    n: "02",
    icon: "radar",
    title: "We make every vehicle AI-discoverable",
    body: "LotPilot structures, publishes and keeps your inventory fresh in the formats AI answer engines read and cite — so your cars start showing up when buyers ask.",
    tag: "Get found by AI",
    tone: "accent",
    meta: "Runs automatically",
  },
  {
    n: "03",
    icon: "messages",
    title: "Our AI agent works the leads",
    body: "Every inbound is answered in seconds over SMS and voice. The agent qualifies the buyer, captures the credit application, books the appointment and pushes the deal forward — 24/7.",
    tag: "Win the lead",
    tone: "violet",
    meta: "Day one, around the clock",
  },
];

const TONE: Record<
  Tone,
  { chip: string; tag: string; num: string; rail: string }
> = {
  cyan: {
    chip: "bg-cyan/12 text-cyan ring-1 ring-cyan/30 shadow-[0_0_22px] shadow-cyan/15",
    tag: "text-cyan",
    num: "text-cyan/25",
    rail: "from-cyan/40",
  },
  accent: {
    chip: "bg-accent/12 text-accent ring-1 ring-accent/30 shadow-[0_0_22px] shadow-accent/15",
    tag: "text-accent",
    num: "text-accent/25",
    rail: "from-accent/40",
  },
  violet: {
    chip: "bg-violet/15 text-violet ring-1 ring-violet/30 shadow-[0_0_22px] shadow-violet/15",
    tag: "text-violet",
    num: "text-violet/25",
    rail: "from-violet/40",
  },
};

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
      <div className="relative">
        {/* connecting rail behind the cards (desktop) */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-[68px] hidden h-px bg-gradient-to-r from-cyan/40 via-accent/40 to-violet/40 md:block"
        />

        <div className="relative grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => {
            const t = TONE[s.tone];
            return (
              <Reveal key={s.n} delay={i * 0.12}>
                <div className="surface surface-hover group relative flex h-full flex-col overflow-hidden rounded-3xl p-7">
                  {/* oversized ghost number */}
                  <span
                    className={`pointer-events-none absolute -right-1 -top-3 select-none font-display text-[5.5rem] leading-none ${t.num}`}
                  >
                    {s.n}
                  </span>

                  {/* top: icon chip on the rail */}
                  <div className="relative flex items-center gap-3">
                    <span
                      className={`relative z-10 grid h-12 w-12 place-items-center rounded-2xl ${t.chip}`}
                    >
                      <Icon name={s.icon} size={22} strokeWidth={2} />
                    </span>
                    <span
                      className={`text-xs font-mono uppercase tracking-wider ${t.tag}`}
                    >
                      {s.tag}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.body}</p>

                  {/* footer meta */}
                  <div className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-xs text-ink-faint">
                    <Icon name="clock" size={14} strokeWidth={2} className={t.tag} />
                    <span>{s.meta}</span>
                  </div>

                  {/* connector arrow between cards (desktop) */}
                  {i < STEPS.length - 1 && (
                    <span className="pointer-events-none absolute -right-[18px] top-[60px] z-20 hidden h-7 w-7 place-items-center rounded-full border border-line bg-white text-ink-faint shadow-sm md:grid">
                      <Icon name="arrow-right" size={14} strokeWidth={2.25} />
                    </span>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
