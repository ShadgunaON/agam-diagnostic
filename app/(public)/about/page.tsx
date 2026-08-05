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
      <CTASection 
        title="Ready to Book Your Test?"
        description="Choose what works best for you. Visit a nearby lab or let our experts come to you."
        primaryActionLabel="Start Booking"
      />
    </>
  );
}
