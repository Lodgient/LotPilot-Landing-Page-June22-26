import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FeedConnect from "@/components/sections/FeedConnect";
import Pricing from "@/components/sections/Pricing";
import AuditSection from "@/components/sections/AuditSection";

export const metadata: Metadata = {
  title: "See LotPilot live · Connect your inventory feed",
  description:
    "Click through the live LotPilot demo or connect your inventory feed. We accept vAuto, HomeNet, Dealer.com, DealerSocket, CSV and XML — zero ongoing work, no sales call.",
  alternates: { canonical: "https://dealers.lotpilot.com/demo" },
};

export default function DemoPage() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative overflow-hidden pt-32 pb-6 sm:pt-40">
          <div className="bg-grid pointer-events-none absolute inset-0" />
          <div className="glow-accent pointer-events-none absolute -top-24 left-1/3 h-[420px] w-[420px]" />
          <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
              Get started
            </p>
            <h1 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl">
              Connect your feed.{" "}
              <span className="font-display text-gradient">We do the rest.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-ink-muted sm:text-lg">
              Send us the inventory export you already produce and a specialist
              will walk you through go-live. Not ready? Run the free audit first.
            </p>
          </div>
        </section>
        <FeedConnect />
        <Pricing />
        <AuditSection />
      </main>
      <Footer />
    </>
  );
}
