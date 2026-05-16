import { AudienceSection } from "../components/sections/audience/audience-section";
import { Footer } from "../components/layout/footer";
import { HeroSection } from "../components/sections/hero/hero-section";
import { IntelligenceSection } from "../components/sections/intelligence/intelligence-section";
import { MemorySection } from "../components/sections/memory/memory-section";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AudienceSection />
      <IntelligenceSection />
      <MemorySection />
      <Footer />
    </main>
  );
}
