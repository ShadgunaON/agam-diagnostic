import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { aboutData as staticAboutData } from '@/data/about';
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
  RecognitionsSection
} from '@/components/sections/about';
import { ContactPreviewSection } from '@/components/sections/home';
import { CTASection } from '@/components/common';

import { pageService } from '@/services/PageService';
import { MediaService } from '@/services/MediaService';
import { AboutPageContent } from '@/domains/cms/models';

export const metadata: Metadata = {
  title: `About Us | ${siteConfig.name}`,
  description: staticAboutData.hero.description,
};

// Next.js Revalidation
export const revalidate = 60; // Revalidate every minute

async function resolveImageUrl(url: string | undefined): Promise<string | undefined> {
  if (!url) return undefined;
  if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('/')) {
    try {
      return await MediaService.getDownloadUrl(url);
    } catch (e) {
      console.error('[AboutPage] Failed to fetch presigned URL for image:', e);
      return url;
    }
  }
  return url;
}

export default async function AboutPage() {
  // 1. Fetch CMS Content
  let cmsContent: AboutPageContent | null = null;
  try {
    const page = await pageService.getPageById('about');
    if (page && page.publishedContent) {
      cmsContent = JSON.parse(page.publishedContent);
    }
  } catch (error) {
    console.error('[AboutPage] Failed to fetch CMS content:', error);
  }

  // 2. Resolve Images & Map Content
  
  // Hero
  const isHeroVisible = cmsContent?.hero?.isVisible ?? true;
  const heroData = {
    title: cmsContent?.hero?.title || staticAboutData.hero.title,
    description: cmsContent?.hero?.description || staticAboutData.hero.description,
    image: await resolveImageUrl(cmsContent?.hero?.image) || staticAboutData.hero.image,
    badges: cmsContent?.hero?.badges || staticAboutData.hero.badges,
  };

  // Trust Features
  const isTrustVisible = cmsContent?.trustFeatures?.isVisible ?? true;
  const trustFeaturesData = cmsContent?.trustFeatures?.items || staticAboutData.trustFeatures;

  // Story
  const isStoryVisible = cmsContent?.story?.isVisible ?? true;
  const storyData = {
    title: cmsContent?.story?.title || staticAboutData.story.title,
    paragraphs: cmsContent?.story?.paragraphs || staticAboutData.story.paragraphs,
    image: await resolveImageUrl(cmsContent?.story?.image) || staticAboutData.story.image,
    stat: cmsContent?.story?.stat || staticAboutData.story.stat,
  };

  // Mission Vision
  const isMissionVisionVisible = cmsContent?.missionVision?.isVisible ?? true;
  const missionVisionData = {
    mission: cmsContent?.missionVision?.mission || staticAboutData.missionVision.mission,
    vision: cmsContent?.missionVision?.vision || staticAboutData.missionVision.vision,
  };

  // Agam Difference
  const isDifferenceVisible = cmsContent?.differenceFeatures?.isVisible ?? true;
  const differenceData = cmsContent?.differenceFeatures?.items || staticAboutData.differenceFeatures;

  // Milestones
  const isMilestonesVisible = cmsContent?.milestones?.isVisible ?? true;
  const milestonesData = cmsContent?.milestones?.items || staticAboutData.milestones;

  // Tech Features
  const isTechVisible = cmsContent?.techFeatures?.isVisible ?? true;
  const techData = cmsContent?.techFeatures?.items || staticAboutData.techFeatures;

  // Team
  const isTeamVisible = cmsContent?.team?.isVisible ?? true;
  const teamMembersRaw = cmsContent?.team?.members || staticAboutData.team;
  const teamData = await Promise.all(
    teamMembersRaw.map(async (member) => ({
      ...member,
      image: await resolveImageUrl(member.image) || member.image,
    }))
  );

  // Recognitions
  const isRecognitionsVisible = cmsContent?.recognitions?.isVisible ?? true;
  const recognitionsData = {
    accreditations: {
      title: cmsContent?.recognitions?.accreditations?.title || staticAboutData.recognitions.accreditations.title,
      intro: cmsContent?.recognitions?.accreditations?.intro || staticAboutData.recognitions.accreditations.intro,
      items: cmsContent?.recognitions?.accreditations?.items || staticAboutData.recognitions.accreditations.items,
    },
    awards: {
      title: cmsContent?.recognitions?.awards?.title || staticAboutData.recognitions.awards.title,
      items: cmsContent?.recognitions?.awards?.items || staticAboutData.recognitions.awards.items,
    },
  };

  // Contact Preview
  const isContactVisible = cmsContent?.contactPreview?.isVisible ?? true;

  // Reviews CTA
  const isReviewsCtaVisible = cmsContent?.reviewsCta?.isVisible ?? true;
  const reviewsCtaData = {
    eyebrow: cmsContent?.reviewsCta?.eyebrow || 'Trusted by our patients',
    title: cmsContent?.reviewsCta?.title || 'Read verified patient experiences',
    buttonLink: cmsContent?.reviewsCta?.buttonLink || '/reviews',
  };

  // Bottom CTA
  const isBottomCtaVisible = cmsContent?.bottomCta?.isVisible ?? true;
  const bottomCtaData = {
    title: cmsContent?.bottomCta?.title || 'Ready to Book Your Test?',
    description: cmsContent?.bottomCta?.description || 'Choose what works best for you. Visit a nearby lab or let our experts come to you.',
    primaryActionLabel: cmsContent?.bottomCta?.primaryActionLabel || 'Start Booking',
    primaryActionLink: cmsContent?.bottomCta?.primaryActionLink || '/book',
  };

  return (
    <>
      {isHeroVisible && <AboutHeroSection data={heroData} />}
      {isTrustVisible && <TrustBarSection data={trustFeaturesData} style={{ marginTop: 'calc(-1 * var(--sp-8))', position: 'relative', zIndex: 10 }} />}
      {isStoryVisible && <StorySection data={storyData} />}
      {isMissionVisionVisible && <MissionVisionSection data={missionVisionData} />}
      {isDifferenceVisible && <AgamDifferenceSection data={differenceData as any} />}
      {isMilestonesVisible && <JourneyTrackerSection data={milestonesData as any} />}
      {isTechVisible && <TechnologyInfrastructureSection data={techData as any} />}
      {isTeamVisible && <TeamSection data={teamData} />}
      {isRecognitionsVisible && <RecognitionsSection data={recognitionsData} />}
      
      {isContactVisible && <ContactPreviewSection data={contactData} />}
      
      {isReviewsCtaVisible && (
        <section className="py-12 bg-bg-alt border-y border-border">
          <div className="container text-center">
            {reviewsCtaData.eyebrow && (
              <p className="text-muted-foreground font-medium mb-4 uppercase tracking-wider text-sm">
                {reviewsCtaData.eyebrow}
              </p>
            )}
            <a href={reviewsCtaData.buttonLink} className="text-primary font-bold text-lg hover:underline group flex items-center justify-center gap-2">
              {reviewsCtaData.title}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </section>
      )}

      {isBottomCtaVisible && (
        <CTASection 
          title={bottomCtaData.title}
          description={bottomCtaData.description}
          primaryActionLabel={bottomCtaData.primaryActionLabel}
        />
      )}
    </>
  );
}
