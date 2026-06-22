import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import AuditTool from "@/components/audit/AuditTool";

export default function AuditSection() {
  return (
    <Section
      id="audit"
      eyebrow="The free AI-Visibility Audit"
      title={
        <>
          Run the check competitors{" "}
          <span className="font-display text-gradient">hope you never see.</span>
        </>
      }
      intro="Drop in your website and city. We query the engines your buyers use with real shopping questions and score how visible you are across five pillars — crawlability, structured data, freshness, citations and entity consistency."
    >
      <Reveal>
        <div className="mx-auto max-w-4xl">
          <AuditTool />
        </div>
      </Reveal>
      <p className="mx-auto mt-5 max-w-2xl text-center text-xs text-ink-faint">
        Results shown are a representative sample of how an un-optimized store
        looks to AI. Connect your feed for a live, store-specific report.
      </p>
    </Section>
  );
}
