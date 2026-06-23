import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Icon, { type IconName } from "@/components/Icon";

const CAPS: { icon: IconName; tone: string; title: string; body: string }[] = [
  { icon: "bolt", tone: "cyan", title: "Speed-to-lead in seconds", body: "Replies the instant a lead lands — SMS and voice — while the buyer is still shopping." },
  { icon: "search", tone: "accent", title: "Qualifies every inquiry", body: "Answers vehicle questions, gauges intent, trade and timeline, and hands your desk only sale-ready buyers." },
  { icon: "file", tone: "violet", title: "Captures credit applications", body: "Walks the buyer through a compliant credit app so deals arrive at your desk pre-started." },
  { icon: "calendar", tone: "accent", title: "Books the appointment", body: "Offers real times, confirms, reminds, and reschedules no-shows automatically." },
  { icon: "trending", tone: "cyan", title: "Progresses the deal", body: "Follows up relentlessly and pushes each opportunity toward appointment and sale." },
  { icon: "clock", tone: "violet", title: "Works 24/7", body: "Nights, weekends, holidays — the agent never misses a lead or a follow-up." },
];

const TONE: Record<string, string> = {
  cyan: "bg-cyan/12 text-cyan ring-1 ring-cyan/30 shadow-[0_0_22px] shadow-cyan/15",
  accent: "bg-accent/12 text-accent ring-1 ring-accent/30 shadow-[0_0_22px] shadow-accent/15",
  violet: "bg-violet/15 text-violet ring-1 ring-violet/30 shadow-[0_0_22px] shadow-violet/15",
};

type Msg = { from: "buyer" | "agent"; text: string; meta?: string };
const THREAD: Msg[] = [
  { from: "buyer", text: "Is the certified RAV4 still available?" },
  {
    from: "agent",
    text: "It is! Clean history, 31k miles, $28,400. Want to take a look this week?",
    meta: "replied in 8s",
  },
  { from: "buyer", text: "Maybe Saturday. Can I get pre-approved first?" },
  {
    from: "agent",
    text: "Absolutely — here's a 2-min secure credit app. I've got Saturday 11:00 or 1:30 open.",
  },
  { from: "buyer", text: "11 works 👍" },
];

function MsgBubble({ m }: { m: Msg }) {
  const isAgent = m.from === "agent";
  return (
    <div className={isAgent ? "" : "flex flex-col items-end"}>
      <div
        className={
          isAgent
            ? "max-w-[80%] rounded-2xl rounded-tl-sm border border-line bg-white px-3.5 py-2.5 text-sm text-ink-soft shadow-sm"
            : "max-w-[80%] rounded-2xl rounded-tr-sm bg-cyan px-3.5 py-2.5 text-sm text-ink-inverse shadow-sm"
        }
      >
        {m.text}
      </div>
      {m.meta && (
        <p className="mt-1 flex items-center gap-1 pl-1 text-[10px] font-medium text-accent">
          <Icon name="bolt" size={11} strokeWidth={2.5} />
          {m.meta}
        </p>
      )}
    </div>
  );
}

export default function Conversion() {
  return (
    <Section
      id="conversion"
      glow="cyan"
      glowSide="left"
      tinted
      eyebrow="Win the lead"
      title={
        <>
          An AI agent that works every lead{" "}
          <span className="font-display text-gradient">instantly.</span>
        </>
      }
      intro="Getting found brings the buyer in. The agent closes the gap — responding in seconds, taking the credit app, and booking the deal, so nothing leaks while your team sleeps."
    >
      <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        {/* LEFT — live SMS conversation mock */}
        <Reveal>
          <div className="relative">
            <div className="glow-cyan pointer-events-none absolute -inset-6 -z-10 opacity-50" />
            <div className="surface overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
              {/* phone header */}
              <div className="flex items-center gap-3 border-b border-line bg-canvas-2/60 px-4 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/12 text-accent ring-1 ring-accent/25">
                  <Icon name="messages" size={18} strokeWidth={2} />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-ink">LotPilot Agent</p>
                  <p className="flex items-center gap-1 text-[11px] text-ink-faint">
                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
                    Online · texting your lead now
                  </p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-ink-soft shadow-sm">
                  <Icon name="phone" size={12} strokeWidth={2} />
                  SMS + voice
                </span>
              </div>

              {/* thread */}
              <div className="space-y-3 p-5">
                {THREAD.map((m, i) => (
                  <MsgBubble key={i} m={m} />
                ))}

                {/* booked confirmation */}
                <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/[0.06] px-3.5 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-accent ring-1 ring-accent/25 shadow-sm">
                    <Icon name="calendar" size={18} strokeWidth={2} />
                  </span>
                  <div className="text-xs">
                    <p className="font-semibold text-ink">Appointment booked · Sat 11:00 AM</p>
                    <p className="text-ink-faint">Credit app started · pushed to your CRM</p>
                  </div>
                  <Icon
                    name="check"
                    size={18}
                    strokeWidth={2.5}
                    className="ml-auto text-accent"
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* RIGHT — capability cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {CAPS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.06}>
              <div className="surface surface-hover h-full rounded-2xl p-6">
                <span
                  className={`grid h-12 w-12 place-items-center rounded-xl ${TONE[c.tone]}`}
                >
                  <Icon name={c.icon} size={22} strokeWidth={2} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={0.1}>
        <div className="relative mt-8 flex flex-col items-center gap-2 overflow-hidden rounded-3xl border border-line-strong bg-gradient-to-br from-accent/[0.10] via-cyan/[0.06] to-violet/[0.10] p-8 text-center">
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
