import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

import { pageService } from '@/services/PageService';
import { MediaService } from '@/services/MediaService';
import { fetchBatchedByIds } from '@/lib/api/cms/batchResolver';
import { HomePageContent } from '@/domains/cms/models';

import { ServiceItem } from '@/domains/services/model';
import { PackageItem } from '@/domains/packages/model';
import { BlogArticle } from '@/domains/blog/model';
import { ReviewModel } from '@/domains/review/model';

import {
  HeroSection,
  StatisticsSection,
  ServicesSection,
  WhyChooseUsSection,
  HealthPackagesSection,
  TestimonialsSection,
  BlogPreviewSection,
  ContactPreviewSection,
  FAQSection
} from '@/components/sections/home';

import { CTASection } from '@/components/common';
import { HomeRedirect } from '@/components/auth/HomeRedirect';

import {
  heroData,
  statisticsData,
  servicesData,
  whyChooseUsData,
  packagesData,
  testimonialsData,
  blogPreviewData,
  contactData,
  faqData
} from '@/data/home';

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
};

// Always server-render so CMS publishedContent is read fresh on each request.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Build hero heading props from the CMS heading string.
 * The CMS stores the full heading (e.g. "Advanced Diagnostics\nYou Can Trust").
 * We extract the last word as the highlighted (red) span to match the design.
 */
function parseHeroHeading(heading: string): { titlePart1: string; titleSpan: string } {
  const trimmed = heading.trimEnd();
  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace > -1) {
    return {
      titlePart1: trimmed.slice(0, lastSpace),
      titleSpan: trimmed.slice(lastSpace + 1),
    };
  }
  return { titlePart1: trimmed, titleSpan: '' };
}

export default async function HomePage() {
  const page = await pageService.getPageById('home');
  let content: HomePageContent | null = null;
  
  if (page?.publishedContent) {
    try {
      content = JSON.parse(page.publishedContent);
    } catch (e) {
      console.error('Failed to parse published CMS content for home page', e);
    }
  }

  // Override metadata if published SEO exists
  if (page?.publishedSeo) {
    try {
      const seo = JSON.parse(page.publishedSeo);
      if (seo.title) metadata.title = seo.title;
      if (seo.description) {
        metadata.description = seo.description;
        if (metadata.openGraph) metadata.openGraph.description = seo.description;
      }
    } catch (e) {}
  }

  // --- Resolve References via Batching ---
  // Fallback to static data when CMS ids are empty OR the batch fetch returns nothing.
  let resolvedServices = servicesData;
  let resolvedPackages = packagesData;
  let resolvedBlogs = blogPreviewData;
  let resolvedReviews: ReviewModel[] = [];

  if (content) {
    if (content.diagnosticSolutions?.serviceIds?.length) {
      try {
        const services = await fetchBatchedByIds<ServiceItem>(
          'serviceById',
          content.diagnosticSolutions.serviceIds,
          'id title description slug'
        );
        if (services.length > 0) {
          resolvedServices = services.map((s, i) => ({
            title: s.title,
            description: s.description || '',
            href: `/services/${s.slug || s.id}`,
            icon: servicesData[i % servicesData.length]?.icon ?? servicesData[0]?.icon,
          }));
        }
      } catch (e) {
        console.error('[HomePage] serviceById batch failed:', e);
      }
    }

    const validPackageIds = content.healthCheckupPlans?.packageIds?.filter(Boolean) || [];
    if (validPackageIds.length > 0) {
      try {
        const pkgs = await fetchBatchedByIds<PackageItem>(
          'packageById',
          validPackageIds,
          'id title description price slug'
        );
        if (pkgs.length > 0) {
          resolvedPackages = pkgs.map(p => ({
            category: 'Health Checkup',
            title: p.title,
            description: p.description || '',
            price: `₹${p.price || 0}`,
            href: `/packages/${p.slug || p.id}`,
            features: [],
          }));
        }
      } catch (e) {
        console.error('[HomePage] packageById batch failed:', e);
      }
    }

    if (content.healthArticles?.blogIds?.length) {
      try {
        const blogs = await fetchBatchedByIds<BlogArticle>(
          'blogById',
          content.healthArticles.blogIds,
          'id title excerpt date author slug',
          'idOrSlug'
        );
        if (blogs.length > 0) {
          resolvedBlogs = blogs.map(b => ({
            title: b.title,
            excerpt: b.description || '',
            date: new Date(Number(b.date || Date.now())).toLocaleDateString(),
            category: 'Health',
            href: `/blog/${b.slug || b.id}`,
          }));
        }
      } catch (e) {
        console.error('[HomePage] blogById batch failed:', e);
      }
    }

    if (content.patientReviews?.reviewIds?.length) {
      try {
        const reviews = await fetchBatchedByIds<ReviewModel>(
          'reviewById',
          content.patientReviews.reviewIds,
          'id displayName content'
        );
        if (reviews.length > 0) {
          resolvedReviews = reviews.map(r => ({
            ...r,
            rating: 5,
            status: 'Approved',
          }));
        }
      } catch (e) {
        console.error('[HomePage] reviewById batch failed:', e);
      }
    }
  }

  // If no CMS content published yet, render with static defaults
  if (!content) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between w-full overflow-x-hidden">
        <HomeRedirect />
        <HeroSection data={heroData} />
        <StatisticsSection data={statisticsData} />
        <ServicesSection data={servicesData} />
        <WhyChooseUsSection data={whyChooseUsData} />
        <HealthPackagesSection data={packagesData} />
        <TestimonialsSection />
        <BlogPreviewSection data={blogPreviewData} />
        <ContactPreviewSection data={contactData} />
        <FAQSection data={faqData} />
        <CTASection 
          title="Ready to Book Your Test?"
          description="Choose what works best for you. Visit a nearby lab or let our experts come to you."
          primaryActionLabel="Start Booking"
        />
      </main>
    );
  }

  // Build hero data from CMS
  const heroHeading = content.hero?.heading || '';
  const { titlePart1, titleSpan } = heroHeading
    ? parseHeroHeading(heroHeading)
    : { titlePart1: heroData.titlePart1, titleSpan: heroData.titleSpan };

  let resolvedHeroImage = content.hero?.image;
  if (resolvedHeroImage && !resolvedHeroImage.startsWith('http') && !resolvedHeroImage.startsWith('data:') && !resolvedHeroImage.startsWith('/')) {
    try {
      resolvedHeroImage = await MediaService.getDownloadUrl(resolvedHeroImage);
    } catch (e) {
      console.error('[HomePage] Failed to fetch presigned URL for hero image:', e);
    }
  }

  const cmsHeroData = {
    ...heroData,
    pillText:    content.hero?.eyebrow      || heroData.pillText,
    titlePart1:  titlePart1                 || heroData.titlePart1,
    titleSpan:   titleSpan                  || heroData.titleSpan,
    description: content.hero?.description  || heroData.description,
    // Pass resolved image from CMS if set; HeroSection reads it via (data as any).image
    ...(resolvedHeroImage ? { image: resolvedHeroImage } : {}),
  };

  // Render CMS-driven layout
  return (
    <main className="flex min-h-screen flex-col w-full">
      <HomeRedirect />
      
      {content.hero?.isVisible !== false && (
        <HeroSection data={cmsHeroData} />
      )}
      
      {content.statistics?.isVisible !== false && (
        <StatisticsSection
          data={content.statistics?.stats?.length > 0 ? content.statistics.stats : statisticsData}
        />
      )}
      
      {content.diagnosticSolutions?.isVisible !== false && (
        <ServicesSection 
          data={resolvedServices} 
          eyebrow={content.diagnosticSolutions?.eyebrow}
          heading={content.diagnosticSolutions?.heading}
          description={content.diagnosticSolutions?.description}
        />
      )}
      
      {content.qualityCare?.isVisible !== false && (
        <WhyChooseUsSection 
          data={content.qualityCare?.features?.length > 0 ? content.qualityCare.features : whyChooseUsData} 
          eyebrow={content.qualityCare?.eyebrow}
          heading={content.qualityCare?.heading}
          description={content.qualityCare?.description}
        />
      )}
      
      {content.healthCheckupPlans?.isVisible !== false && (
        <HealthPackagesSection 
          data={resolvedPackages} 
          eyebrow={content.healthCheckupPlans?.eyebrow}
          heading={content.healthCheckupPlans?.heading}
        />
      )}
      
      {content.patientReviews?.isVisible !== false && (
        <TestimonialsSection 
          initialReviews={resolvedReviews.length > 0 ? resolvedReviews : (testimonialsData as any)} 
          eyebrow={content.patientReviews?.eyebrow}
          heading={content.patientReviews?.heading}
        />
      )}
      
      {content.healthArticles?.isVisible !== false && (
        <BlogPreviewSection 
          data={resolvedBlogs} 
          eyebrow={content.healthArticles?.eyebrow}
          heading={content.healthArticles?.heading}
          description={content.healthArticles?.description}
        />
      )}
      
      {content.mainLab?.isVisible !== false && (
        <ContactPreviewSection 
          data={{
            ...contactData,
            address: [content.mainLab?.address || contactData.address?.[0] || ''],
            phone: content.mainLab?.phone || contactData.phone,
            hours: content.mainLab?.hours ? [content.mainLab.hours] : contactData.hours,
          }}
          eyebrow={content.mainLab?.eyebrow}
          heading={content.mainLab?.heading}
          description={content.mainLab?.description}
        />
      )}
      
      {content.faq?.isVisible !== false && (
        <FAQSection 
          data={content.faq?.faqs?.length ? content.faq.faqs : faqData} 
          eyebrow={content.faq?.eyebrow}
          heading={content.faq?.heading}
          description={content.faq?.description}
        />
      )}
      
      {content.bookingCta?.isVisible !== false && (
        <CTASection 
          title={content.bookingCta?.heading || "Ready to Book Your Test?"}
          description={content.bookingCta?.description || "Choose what works best for you. Visit a nearby lab or let our experts come to you."}
          primaryActionLabel={content.bookingCta?.buttonText || "Start Booking"}
          primaryActionHref={content.bookingCta?.buttonLink || "/book"}
        />
      )}
    </main>
  );
}
