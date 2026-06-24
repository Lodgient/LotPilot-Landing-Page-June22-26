import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import ShowcaseGallery from "./ShowcaseGallery";

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
      intro="LotPilot is a live command center for the answer economy: see what ChatGPT, Grok, Perplexity, Gemini and Claude say about your store, which competitors are winning your buyers, and the gross it's costing you — then watch the gaps close. Click through the views below."
    >
      <Reveal>
        <ShowcaseGallery />
      </Reveal>
    </Section>
  );
}
