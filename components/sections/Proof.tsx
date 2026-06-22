import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";

/**
 * PLACEHOLDER metric. Intentionally shows no fabricated number — the team
 * fills `value` once pilot results are confirmed. Until then it renders a
 * clearly-labeled pending state. (CLAUDE CODE BRIEF §8/§9: never invent metrics.)
 */
function Metric({ value, label }: { value?: string; label: string }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.02] p-5 text-center">
      <p className="text-3xl font-bold tracking-tight">
        {value ?? <span className="text-ink-faint">—</span>}
      </p>
      <p className="mt-1 text-xs text-ink-muted">{label}</p>
      {!value && (
        <p className="mt-2 text-[10px] uppercase tracking-wider text-ink-faint">
          pilot metric pending
        </p>
      )}
    </div>
  );
}

const PILOTS = [
  {
    name: "Capitol Nissan Infiniti",
    type: "Franchise dealer · pilot",
  },
  {
    name: "Unique Drive",
    type: "Independent dealer · pilot",
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
      intro="We're rolling out with select franchise and independent stores. Verified results land here as pilots report — no invented numbers."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {PILOTS.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.1}>
            <div className="surface surface-hover h-full rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/[0.05] font-display text-xl text-gradient ring-1 ring-line-strong">
                  {p.name.charAt(0)}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink">{p.name}</h3>
                  <p className="text-xs text-ink-muted">{p.type}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Metric label="AI visibility lift" />
                <Metric label="Speed-to-lead" />
                <Metric label="Credit apps captured" />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
