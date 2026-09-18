import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

import { pageService } from '@/services/PageService';
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

  // --- Resolve References via Batching if CMS Content Exists ---
  let resolvedServices = servicesData;
  let resolvedPackages = packagesData;
  let resolvedBlogs = blogPreviewData;
  let resolvedReviews: ReviewModel[] = [];

  if (content) {
    if (content.diagnosticSolutions?.serviceIds?.length) {
      const services = await fetchBatchedByIds<ServiceItem>('serviceById', content.diagnosticSolutions.serviceIds, 'id title description slug');
      resolvedServices = services.map(s => ({
        title: s.title,
        description: s.description || '',
        href: `/services/${s.slug || s.id}`,
        icon: servicesData[0]?.icon // Fallback icon
      }));
    }

    if (content.healthCheckupPlans?.packageIds?.length) {
      const pkgs = await fetchBatchedByIds<PackageItem>('packageById', content.healthCheckupPlans.packageIds, 'id title description price slug');
      resolvedPackages = pkgs.map(p => ({
        category: 'Health Checkup',
        title: p.title,
        description: p.description || '',
        price: `₹${p.price || 0}`,
        href: `/packages/${p.slug || p.id}`,
        features: []
      }));
    }

    if (content.healthArticles?.blogIds?.length) {
      const blogs = await fetchBatchedByIds<BlogArticle>('blogById', content.healthArticles.blogIds, 'id title excerpt date author slug');
      resolvedBlogs = blogs.map(b => ({
        title: b.title,
        excerpt: b.description || '',
        date: new Date(Number(b.date || Date.now())).toLocaleDateString(),
        category: 'Health',
        href: `/blog/${b.slug || b.id}`
      }));
    }

    if (content.patientReviews?.reviewIds?.length) {
      const reviews = await fetchBatchedByIds<ReviewModel>('reviewById', content.patientReviews.reviewIds, 'id displayName content');
      resolvedReviews = reviews.map(r => ({
        ...r,
        rating: 5,
        status: 'Approved'
      }));
    }
  }

  // If no content is deployed yet, fallback to the default static component layout completely
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

  // Render CMS-driven layout
  return (
    <main className="flex min-h-screen flex-col w-full">
      <HomeRedirect />
      
      {content.hero?.isVisible !== false && <HeroSection data={{
        ...heroData, // Fallback for complex un-migrated fields
        pillText: content.hero.eyebrow || heroData.pillText,
        titlePart1: content.hero.heading || heroData.titlePart1,
        titleSpan: '', // CMS heading holds the full heading now
        description: content.hero.description || heroData.description,
      }} />}
      
      {content.statistics?.isVisible !== false && <StatisticsSection data={content.statistics.stats.length > 0 ? content.statistics.stats : statisticsData} />}
      
      {content.diagnosticSolutions?.isVisible !== false && (
        <ServicesSection 
          data={resolvedServices} 
          eyebrow={content.diagnosticSolutions.eyebrow}
          heading={content.diagnosticSolutions.heading}
          description={content.diagnosticSolutions.description}
        />
      )}
      
      {content.qualityCare?.isVisible !== false && (
        <WhyChooseUsSection 
          data={content.qualityCare.features.length > 0 ? content.qualityCare.features : whyChooseUsData} 
          eyebrow={content.qualityCare.eyebrow}
          heading={content.qualityCare.heading}
          description={content.qualityCare.description}
        />
      )}
      
      {content.healthCheckupPlans?.isVisible !== false && (
        <HealthPackagesSection 
          data={resolvedPackages} 
          eyebrow={content.healthCheckupPlans.eyebrow}
          heading={content.healthCheckupPlans.heading}
        />
      )}
      
      {content.patientReviews?.isVisible !== false && (
        <TestimonialsSection 
          initialReviews={resolvedReviews.length > 0 ? resolvedReviews : (testimonialsData as any)} 
          eyebrow={content.patientReviews.eyebrow}
          heading={content.patientReviews.heading}
        />
      )}
      
      {content.healthArticles?.isVisible !== false && (
        <BlogPreviewSection 
          data={resolvedBlogs} 
          eyebrow={content.healthArticles.eyebrow}
          heading={content.healthArticles.heading}
          description={content.healthArticles.description}
        />
      )}
      
      {content.mainLab?.isVisible !== false && (
        <ContactPreviewSection 
          data={{
            ...contactData,
            address: [content.mainLab.address],
            phone: content.mainLab.phone,
            email: contactData.email, // Kept static for now or can add to CMS
          }}
          eyebrow={content.mainLab.eyebrow}
          heading={content.mainLab.heading}
          description={content.mainLab.description}
        />
      )}
      
      {content.faq?.isVisible !== false && (
        <FAQSection 
          data={content.faq.faqs?.length ? content.faq.faqs : faqData} 
          eyebrow={content.faq.eyebrow}
          heading={content.faq.heading}
          description={content.faq.description}
        />
      )}
      
      {content.bookingCta?.isVisible !== false && (
        <CTASection 
          title={content.bookingCta.heading || "Ready to Book Your Test?"}
          description={content.bookingCta.description || "Choose what works best for you. Visit a nearby lab or let our experts come to you."}
          primaryActionLabel={content.bookingCta.buttonText || "Start Booking"}
          primaryActionHref={content.bookingCta.buttonLink || "/book"}
        />
      )}
    </main>
  );
}
