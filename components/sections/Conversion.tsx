import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";

const CAPS = [
  { icon: "⚡", tone: "cyan", title: "Speed-to-lead in seconds", body: "Replies the instant a lead lands — SMS and voice — while the buyer is still shopping." },
  { icon: "🔎", tone: "accent", title: "Qualifies every inquiry", body: "Answers vehicle questions, gauges intent, trade and timeline, and routes hot buyers to your team." },
  { icon: "📄", tone: "violet", title: "Captures credit applications", body: "Walks the buyer through a compliant credit app so deals arrive at your desk pre-started." },
  { icon: "📅", tone: "accent", title: "Books the appointment", body: "Offers real times, confirms, reminds, and reschedules no-shows automatically." },
  { icon: "🤝", tone: "cyan", title: "Progresses the deal", body: "Follows up relentlessly and pushes each opportunity toward appointment and sale." },
  { icon: "🕒", tone: "violet", title: "Works 24/7", body: "Nights, weekends, holidays — the agent never misses a lead or a follow-up." },
] as const;

const TONE: Record<string, string> = {
  cyan: "bg-cyan/12 ring-1 ring-cyan/30 shadow-[0_0_22px] shadow-cyan/15",
  accent: "bg-accent/12 ring-1 ring-accent/30 shadow-[0_0_22px] shadow-accent/15",
  violet: "bg-violet/15 ring-1 ring-violet/30 shadow-[0_0_22px] shadow-violet/15",
};

export default function Conversion() {
  return (
    <Section
      id="conversion"
      glow="cyan"
      glowSide="left"
      tinted
      eyebrow="Conversion layer"
      title={
        <>
          An AI agent that works every lead{" "}
          <span className="font-display text-gradient">instantly.</span>
        </>
      }
      intro="Discovery brings the buyer. The agent closes the gap — responding in seconds, taking the credit app, and booking the deal, so nothing leaks while your team sleeps."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAPS.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.06}>
            <div className="surface surface-hover h-full rounded-2xl p-6">
              <span
                className={`grid h-12 w-12 place-items-center rounded-xl text-xl ${TONE[c.tone]}`}
              >
                {c.icon}
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="relative mt-8 flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-line-strong bg-gradient-to-br from-accent/[0.10] via-cyan/[0.06] to-violet/[0.10] p-8 text-center">
          <div className="glow-cyan pointer-events-none absolute -right-16 -top-16 h-48 w-48 opacity-60" />
          <p className="relative font-display text-2xl text-ink sm:text-3xl">
            &ldquo;Responds in seconds. Works around the clock. Never reselling your buyer.&rdquo;
          </p>
          <p className="relative text-sm text-ink-soft">
            That&apos;s the difference between a lead and a sale.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
