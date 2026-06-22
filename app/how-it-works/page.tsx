import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/sections/HowItWorks";
import Discovery from "@/components/sections/Discovery";
import Conversion from "@/components/sections/Conversion";
import Comparison from "@/components/sections/Comparison";
import FinalCTA from "@/components/sections/FinalCTA";

export const metadata: Metadata = {
  title: "How it works — discovery + conversion",
  description:
    "How LotPilot works: connect your inventory feed, we make every vehicle discoverable in AI answer engines, then our AI agents work every lead — qualify, capture credit apps, and book the deal.",
  alternates: { canonical: "https://dealers.lotpilot.com/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative overflow-hidden pt-32 pb-6 sm:pt-40">
          <div className="bg-grid pointer-events-none absolute inset-0" />
          <div className="glow-cyan pointer-events-none absolute -top-20 right-1/4 h-[420px] w-[420px]" />
          <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
              The model
            </p>
            <h1 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl">
              Two layers, one feed.{" "}
              <span className="font-display text-gradient">
                Discovery that finds buyers, conversion that closes them.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-ink-muted sm:text-lg">
              Connect the inventory feed you already export. LotPilot handles
              everything downstream — getting your cars recommended by AI and
              working every lead that comes back.
            </p>
          </div>
        </section>
        <HowItWorks />
        <Discovery />
        <Conversion />
        <Comparison />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
