import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import AuditSection from "@/components/sections/AuditSection";
import ProductShowcase from "@/components/sections/ProductShowcase";
import HowItWorks from "@/components/sections/HowItWorks";
import Discovery from "@/components/sections/Discovery";
import Conversion from "@/components/sections/Conversion";
import Comparison from "@/components/sections/Comparison";
import Proof from "@/components/sections/Proof";
import FeedConnect from "@/components/sections/FeedConnect";
import Inevitable from "@/components/sections/Inevitable";
import Pricing from "@/components/sections/Pricing";
import FinalCTA from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Nav />
      {/* clip decorative glow/drift bleed so the page never scrolls sideways on mobile */}
      <main className="overflow-x-clip">
        <Hero />
        <Problem />
        <AuditSection />
        <ProductShowcase />
        <HowItWorks />
        <Discovery />
        <Conversion />
        <Comparison />
        <Proof />
        <FeedConnect />
        <Inevitable />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
