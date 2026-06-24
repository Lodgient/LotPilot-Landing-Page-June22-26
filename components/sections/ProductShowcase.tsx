import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";

function Frame({ src, alt, label }: { src: string; alt: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line-strong bg-panel shadow-[0_30px_80px_-32px_rgba(15,23,34,0.38)]">
      <div className="flex items-center gap-1.5 border-b border-line bg-canvas-2 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-warn/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/40" />
        <span className="ml-2 truncate text-[10px] text-ink-faint">{label}</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={1600} height={1000} loading="lazy" className="block w-full" />
    </div>
  );
}

const SHOTS = [
  {
    src: "/product/command.webp",
    label: "dashboard",
    title: "Command Center",
    body: "Every morning: what your AI did overnight — gross influenced, leads worked, appointments booked.",
  },
  {
    src: "/product/inventory.webp",
    label: "dashboard/inventory",
    title: "Inventory AI",
    body: "Every car scored for AI visibility and ranked by the gross it's leaving on the table.",
  },
  {
    src: "/product/roi.webp",
    label: "dashboard/roi",
    title: "ROI & Attribution",
    body: "Sold cars and gross traced to the exact AI engine that produced them.",
  },
];

export default function ProductShowcase() {
  return (
    <Section
      id="product"
      eyebrow="The product"
      title={
        <>
          See exactly where you stand —{" "}
          <span className="font-display text-gradient">then win it back.</span>
        </>
      }
      intro="LotPilot is a live command center for the answer economy: see what ChatGPT, Grok, Perplexity, Gemini and Claude say about your store, which competitors are winning your buyers, and the gross it's costing you — then watch the gaps close."
    >
      <Reveal>
        <Frame
          src="/product/visibility.webp"
          alt="LotPilot AI Visibility dashboard — per-engine visibility and the live AI answer monitor"
          label="dealers.lotpilot.com/dashboard/visibility"
        />
      </Reveal>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {SHOTS.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08}>
            <Frame src={s.src} alt={`LotPilot ${s.title}`} label={`dealers.lotpilot.com/${s.label}`} />
            <p className="mt-3 text-sm font-semibold text-ink">{s.title}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{s.body}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
