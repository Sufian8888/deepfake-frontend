import { PublicNavbar } from "@/components/ui/public-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
