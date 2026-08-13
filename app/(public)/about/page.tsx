import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { aboutData } from '@/data/about';
import { contactData } from '@/data/home';

import {
  AboutHeroSection,
  TrustBarSection,
  StorySection,
  MissionVisionSection,
  AgamDifferenceSection,
  JourneyTrackerSection,
  TechnologyInfrastructureSection,
  TeamSection,
  AccreditationsSection
} from '@/components/sections/about';
import { ContactPreviewSection } from '@/components/sections/home';
import { CTASection } from '@/components/common';

export const metadata: Metadata = {
  title: `About Us | ${siteConfig.name}`,
  description: aboutData.hero.description,
};

export default function AboutPage() {
  return (
    <>
      <AboutHeroSection data={aboutData.hero} />
      <TrustBarSection data={aboutData.trustFeatures} style={{ marginTop: 'calc(-1 * var(--sp-8))', position: 'relative', zIndex: 10 }} />
      <StorySection data={aboutData.story} />
      <MissionVisionSection data={aboutData.missionVision} />
      <AgamDifferenceSection data={aboutData.differenceFeatures} />
      <JourneyTrackerSection data={aboutData.milestones} />
      <TechnologyInfrastructureSection data={aboutData.techFeatures} />
      <TeamSection data={aboutData.team} />
      <AccreditationsSection data={aboutData.accreditations} />
      <ContactPreviewSection data={contactData} />
      <section className="py-12 bg-bg-alt border-y border-border">
        <div className="container text-center">
          <p className="text-muted-foreground font-medium mb-4 uppercase tracking-wider text-sm">Trusted by our patients</p>
          <a href="/reviews" className="text-primary font-bold text-lg hover:underline group flex items-center justify-center gap-2">
            Read verified patient experiences
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </section>
      <CTASection 
        title="Ready to Book Your Test?"
        description="Choose what works best for you. Visit a nearby lab or let our experts come to you."
        primaryActionLabel="Start Booking"
      />
    </>
  );
}
