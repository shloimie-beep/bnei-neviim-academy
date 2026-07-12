import React from 'react';
import { oneTimeLandingContent } from './oneTimeLandingContent';
import { AudienceSection } from './components/AudienceSection';
import { BenefitsGrid } from './components/BenefitsGrid';
import { HeroSection } from './components/HeroSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { LandingFooter } from './components/LandingFooter';
import { LandingHeader } from './components/LandingHeader';
import { MediaLogoMarquee } from './components/MediaLogoMarquee';
import { OutcomesSection } from './components/OutcomesSection';
import { RabbiProfileSection } from './components/RabbiProfileSection';
import { RobotSchellerLauncher } from './components/RobotSchellerLauncher';
import { SignupDialog } from './components/SignupDialog';
import { TeachingLocationsCarousel } from './components/TeachingLocationsCarousel';

type OneTimeLandingPageProps = {
  onSignup: () => void;
};

export function OneTimeLandingPage({ onSignup }: OneTimeLandingPageProps) {
  return (
    <>
      <LandingHeader onSignup={onSignup} />
      <main id="main">
        <HeroSection onSignup={onSignup} />
        <section className="promotion" aria-label={oneTimeLandingContent.offer.label}>
          <strong>{oneTimeLandingContent.offer.headline}</strong>
          <p>{oneTimeLandingContent.offer.copy}</p>
          <button type="button" onClick={onSignup}>Sign Up Now</button>
        </section>
        <RabbiProfileSection />
        <MediaLogoMarquee />
        <TeachingLocationsCarousel />
        <OutcomesSection />
        <BenefitsGrid />
        <HowItWorksSection />
        <AudienceSection onSignup={onSignup} />
        <SignupDialog />
      </main>
      <LandingFooter />
      <RobotSchellerLauncher />
    </>
  );
}
