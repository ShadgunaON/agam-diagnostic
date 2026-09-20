import React from 'react';
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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePreviewPage() {
  const page = await pageService.getPageById('home');
  let content: HomePageContent | null = null;
  
  if (page?.draftContent) {
    try {
      content = JSON.parse(page.draftContent);
    } catch (e) {
      console.error('Failed to parse draft CMS content for home page', e);
    }
  } else if (page?.publishedContent) {
    try {
      content = JSON.parse(page.publishedContent);
    } catch (e) {
      console.error('Failed to parse published CMS content for home page', e);
    }
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

    const validPackageIds = content.healthCheckupPlans?.packageIds?.filter(Boolean) || [];
    if (validPackageIds.length > 0) {
      const pkgs = await fetchBatchedByIds<PackageItem>('packageById', validPackageIds, 'id title description price slug');
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

  // If no content, just show a blank state or fallback to default
  if (!content) {
    return <div className="p-12 text-center text-gray-500">No Draft Content Found</div>;
  }

  return (
    <div className="preview-container bg-white">
      <div className="bg-amber-100 text-amber-800 text-center text-sm py-2 font-medium sticky top-0 z-50 shadow">
        ADMIN PREVIEW MODE — You are viewing the Draft content.
      </div>
      <main className="flex min-h-screen flex-col w-full">
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
              email: contactData.email,
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
    </div>
  );
}
