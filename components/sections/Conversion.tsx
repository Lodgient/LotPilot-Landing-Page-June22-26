import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";

const CAPS = [
  { icon: "⚡", title: "Speed-to-lead in seconds", body: "Replies the instant a lead lands — SMS and voice — while the buyer is still shopping." },
  { icon: "🔎", title: "Qualifies every inquiry", body: "Answers vehicle questions, gauges intent, trade and timeline, and routes hot buyers to your team." },
  { icon: "📄", title: "Captures credit applications", body: "Walks the buyer through a compliant credit app so deals arrive at your desk pre-started." },
  { icon: "📅", title: "Books the appointment", body: "Offers real times, confirms, reminds, and reschedules no-shows automatically." },
  { icon: "🤝", title: "Progresses the deal", body: "Follows up relentlessly and pushes each opportunity toward appointment and sale." },
  { icon: "🕒", title: "Works 24/7", body: "Nights, weekends, holidays — the agent never misses a lead or a follow-up." },
];

export default function Conversion() {
  return (
    <Section
      id="conversion"
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
            <div className="surface h-full rounded-2xl p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.05] text-xl">
                {c.icon}
              </span>
              <h3 className="mt-4 text-base font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{c.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-accent/25 bg-accent/[0.05] p-6 text-center">
          <p className="font-display text-2xl text-ink">
            &ldquo;Responds in seconds. Works around the clock. Never reselling your buyer.&rdquo;
          </p>
          <p className="text-sm text-ink-muted">
            That&apos;s the difference between a lead and a sale.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
