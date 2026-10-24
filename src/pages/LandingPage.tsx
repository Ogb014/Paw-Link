import { PublicNavbar } from "../components/layout/PublicNavbar";
import { PublicFooter } from "../components/layout/PublicFooter";
import { Hero } from "../components/landing/Hero";
import { Features } from "../components/landing/Features";
import { ForBreeders } from "../components/landing/ForBreeders";
import { MarketplacePreview } from "../components/landing/MarketplacePreview";
import { Pricing } from "../components/landing/Pricing";
import { CTASection } from "../components/landing/CTASection";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main>
        <Hero />
        <Features />
        <ForBreeders />
        <MarketplacePreview />
        <Pricing />
        <CTASection />
      </main>
      <PublicFooter />
    </div>
  );
}
