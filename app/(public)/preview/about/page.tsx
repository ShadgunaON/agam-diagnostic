import { AdminAuthGuard } from '@/components/admin/layout/AdminAuthGuard';
import React from 'react';
import { pageService } from '@/services/PageService';
import { MediaService } from '@/services/MediaService';
import { AboutPageContent } from '@/domains/cms/models';

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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function resolveImageUrl(url: string | undefined): Promise<string | undefined> {
  if (!url) return undefined;
  if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('/')) {
    try {
      return await MediaService.getDownloadUrl(url);
    } catch (e) {
      console.error('[AboutPreview] Failed to fetch presigned URL for image:', e);
      return url;
    }
  }
  return url;
}

async function AboutPreviewPage() {
  const page = await pageService.getPageById('about');
  let content: AboutPageContent | null = null;
  
  if (page?.draftContent) {
    try {
      content = JSON.parse(page.draftContent);
    } catch (e) {
      console.error('Failed to parse draft CMS content for about page', e);
    }
  } else if (page?.publishedContent) {
    try {
      content = JSON.parse(page.publishedContent);
    } catch (e) {
      console.error('Failed to parse published CMS content for about page', e);
    }
  }

  // If no content, just show a blank state or fallback to default
  if (!content) {
    return <div className="p-12 text-center text-gray-500">No Draft Content Found</div>;
  }

  // Resolve Images & Map Content
  
  const isHeroVisible = content.hero?.isVisible ?? true;
  const heroData = {
    title: content.hero?.title || staticAboutData.hero.title,
    description: content.hero?.description || staticAboutData.hero.description,
    image: await resolveImageUrl(content.hero?.image) || staticAboutData.hero.image,
    badges: content.hero?.badges || staticAboutData.hero.badges,
  };

  const isTrustVisible = content.trustFeatures?.isVisible ?? true;
  const trustFeaturesData = content.trustFeatures?.items || staticAboutData.trustFeatures;

  const isStoryVisible = content.story?.isVisible ?? true;
  const storyData = {
    title: content.story?.title || staticAboutData.story.title,
    paragraphs: content.story?.paragraphs || staticAboutData.story.paragraphs,
    image: await resolveImageUrl(content.story?.image) || staticAboutData.story.image,
    stat: content.story?.stat || staticAboutData.story.stat,
  };

  const isMissionVisionVisible = content.missionVision?.isVisible ?? true;
  const missionVisionData = {
    mission: content.missionVision?.mission || staticAboutData.missionVision.mission,
    vision: content.missionVision?.vision || staticAboutData.missionVision.vision,
  };

  const isDifferenceVisible = content.differenceFeatures?.isVisible ?? true;
  const differenceData = content.differenceFeatures?.items || staticAboutData.differenceFeatures;

  const isMilestonesVisible = content.milestones?.isVisible ?? true;
  const milestonesData = content.milestones?.items || staticAboutData.milestones;

  const isTechVisible = content.techFeatures?.isVisible ?? true;
  const techData = content.techFeatures?.items || staticAboutData.techFeatures;

  const isTeamVisible = content.team?.isVisible ?? true;
  const teamMembersRaw = content.team?.members || staticAboutData.team;
  const teamData = await Promise.all(
    teamMembersRaw.map(async (member) => ({
      ...member,
      image: await resolveImageUrl(member.image) || member.image,
    }))
  );

  const isRecognitionsVisible = content.recognitions?.isVisible ?? true;
  const recognitionsData = {
    accreditations: {
      title: content.recognitions?.accreditations?.title || staticAboutData.recognitions.accreditations.title,
      intro: content.recognitions?.accreditations?.intro || staticAboutData.recognitions.accreditations.intro,
      items: content.recognitions?.accreditations?.items || staticAboutData.recognitions.accreditations.items,
    },
    awards: {
      title: content.recognitions?.awards?.title || staticAboutData.recognitions.awards.title,
      items: content.recognitions?.awards?.items || staticAboutData.recognitions.awards.items,
    },
  };

  const isContactVisible = content.contactPreview?.isVisible ?? true;

  const isReviewsCtaVisible = content.reviewsCta?.isVisible ?? true;
  const reviewsCtaData = {
    eyebrow: content.reviewsCta?.eyebrow || 'Trusted by our patients',
    title: content.reviewsCta?.title || 'Read verified patient experiences',
    buttonLink: content.reviewsCta?.buttonLink || '/reviews',
  };

  const isBottomCtaVisible = content.bottomCta?.isVisible ?? true;
  const bottomCtaData = {
    title: content.bottomCta?.title || 'Ready to Book Your Test?',
    description: content.bottomCta?.description || 'Choose what works best for you. Visit a nearby lab or let our experts come to you.',
    primaryActionLabel: content.bottomCta?.primaryActionLabel || 'Start Booking',
    primaryActionLink: content.bottomCta?.primaryActionLink || '/book',
  };

  return (
    <div className="preview-container bg-white">
      <div className="bg-amber-100 text-amber-800 text-center text-sm py-2 font-medium sticky top-0 z-50 shadow">
        ADMIN PREVIEW MODE — You are viewing the Draft content.
      </div>
      <main className="flex min-h-screen flex-col w-full">
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
            primaryActionHref={bottomCtaData.primaryActionLink}
          />
        )}
      </main>
    </div>
  );
}




export default function ProtectedAboutPreviewPage() {
  return (
    <AdminAuthGuard>
      <AboutPreviewPage />
    </AdminAuthGuard>
  );
}
