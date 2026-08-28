import { Navigate } from 'react-router-dom';
import { FeaturesSection, HowItWorksSection, PricingFaqSection } from '../components/landing/FeatureSections';
import { HeroSection } from '../components/landing/HeroSection';
import { LandingFooter } from '../components/landing/LandingFooter';
import { LandingNav } from '../components/landing/LandingNav';
import { MarqueeSection } from '../components/landing/MarqueeSection';
import { CtaSection, ProofSection } from '../components/landing/ProofSection';
import { StorySection } from '../components/landing/StorySection';
import { useAuth } from '../hooks/useAuth';

export const LandingPage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="landed-brutal overflow-x-hidden bg-[#fbf7ef] font-sans text-[#080808] antialiased">
      <LandingNav />
      <HeroSection />
      <MarqueeSection />
      <StorySection />
      <HowItWorksSection />
      <FeaturesSection />
      <ProofSection />
      <PricingFaqSection />
      <CtaSection />
      <LandingFooter />
    </main>
  );
};
