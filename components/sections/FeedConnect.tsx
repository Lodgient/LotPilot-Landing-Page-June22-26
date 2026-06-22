import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import FeedForm from "@/components/forms/FeedForm";

const FEEDS = ["vAuto", "HomeNet", "Dealer.com", "DealerSocket", "CSV", "XML"];

export default function FeedConnect() {
  return (
    <Section
      id="feed"
      glow="cyan"
      glowSide="left"
      eyebrow="The only thing we need from you"
      title={
        <>
          Send the feed you{" "}
          <span className="font-display text-gradient">already export.</span>
        </>
      }
      intro="No migration, no rebuild, no new dashboard to learn. We take the inventory file your current tools already produce — and handle everything downstream."
      centered={false}
    >
      <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div>
            <p className="text-sm uppercase tracking-wider text-ink-faint">
              We accept
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {FEEDS.map((f) => (
                <span
                  key={f}
                  className="rounded-xl border border-line-strong bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-ink-soft"
                >
                  {f}
                </span>
              ))}
              <span className="rounded-xl border border-line bg-transparent px-4 py-2.5 text-sm text-ink-faint">
                + anything else, just ask
              </span>
            </div>

            <ul className="mt-8 space-y-4">
              {[
                "Zero ongoing work for your team after connect.",
                "We keep it fresh automatically — sold units drop, prices update.",
                "Multi-rooftop groups supported from day one.",
                "Your data stays yours. US-only. Never resold.",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm text-ink-soft">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs text-accent">
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <FeedForm />
        </Reveal>
      </div>
    </Section>
  );
}
