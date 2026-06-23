import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";

// What we're tracking on the launch pilot. Verified numbers replace this once
// the pilot reports — we never invent metrics. (CLAUDE CODE BRIEF §8/§9.)
const TRACKING = ["AI visibility lift", "Speed-to-lead", "Credit apps captured"];

const PILOTS = [
  {
    name: "Capitol Nissan Infiniti",
    type: "Franchise dealer · pilot",
  },
];

export default function Proof() {
  return (
    <Section
      glow="violet"
      tinted
      eyebrow="Proof in progress"
      title={
        <>
          Live with{" "}
          <span className="font-display text-gradient">launch pilots.</span>
        </>
      }
      intro="We're rolling out with a select launch store. Verified results land here as the pilot reports — no invented numbers."
    >
      <div className="mx-auto max-w-2xl">
        {PILOTS.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.1}>
            <div className="surface surface-hover h-full rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/[0.05] font-display text-xl text-gradient ring-1 ring-line-strong">
                  {p.name.charAt(0)}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink">{p.name}</h3>
                  <p className="text-xs text-ink-muted">{p.type}</p>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-line bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-soft">
                  <span className="inline-flex items-center gap-1.5 text-accent">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Feed connected
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-cyan">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan" /> AI agent live
                  </span>
                </div>
                <p className="mt-3 text-xs text-ink-muted">
                  Tracking{" "}
                  {TRACKING.map((t, i) => (
                    <span key={t} className="text-ink-soft">
                      {t}
                      {i < TRACKING.length - 1 ? " · " : ""}
                    </span>
                  ))}{" "}
                  — verified results post at 30 / 60 / 90 days.
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
