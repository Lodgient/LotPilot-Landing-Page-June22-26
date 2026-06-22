import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import AuditSection from "@/components/sections/AuditSection";
import HowItWorks from "@/components/sections/HowItWorks";
import Discovery from "@/components/sections/Discovery";
import Conversion from "@/components/sections/Conversion";
import Comparison from "@/components/sections/Comparison";
import Proof from "@/components/sections/Proof";
import FeedConnect from "@/components/sections/FeedConnect";
import Pricing from "@/components/sections/Pricing";
import FinalCTA from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <AuditSection />
        <HowItWorks />
        <Discovery />
        <Conversion />
        <Comparison />
        <Proof />
        <FeedConnect />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
