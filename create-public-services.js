const fs = require('fs');
const path = require('path');

const code = `import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { pageService } from '@/services/PageService';
import { MediaService } from '@/services/MediaService';
import { serviceCatalogService } from '@/services/ServiceCatalogService';
import { ServicesPageContent } from '@/domains/cms/models';

import { ServicesHeroSection, ServicesCatalogSection } from '@/components/sections/services';
import { CTASection } from '@/components/common';
import { TrustBarSection as TrustBar } from '@/components/sections/about';
import { ErrorState, EmptyState } from '@/components/common';

export const metadata: Metadata = {
  title: \`Clinical & Diagnostic Services | \${siteConfig.name}\`,
  description: 'Explore our comprehensive range of clinical and diagnostic services.',
};

// Revalidate every 60 s so admin catalog changes appear without a full redeploy
export const dynamic = 'force-dynamic';
export const revalidate = 60;

async function resolveImageUrl(url: string | undefined): Promise<string | undefined> {
  if (!url) return undefined;
  if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('/')) {
    try {
      return await MediaService.getDownloadUrl(url);
    } catch (e) {
      console.error('[ServicesPage] Failed to fetch presigned URL for image:', e);
      return url;
    }
  }
  return url;
}

const defaultTrustBarData = [
  { title: "NABL Accredited", description: "Highest quality standards", icon: "ShieldCheck" },
  { title: "Fastest Reports", description: "Same day delivery online", icon: "Clock" },
  { title: "Free Home Collection", description: "Available across Madurai", icon: "Home" },
  { title: "24/7 Support", description: "Call or WhatsApp anytime", icon: "Phone" }
];

export default async function ServicesPage() {
  const [pageResult, catalogResult] = await Promise.all([
    pageService.getPageById('services'),
    serviceCatalogService.getCatalog(1, 100),
  ]);

  if (catalogResult.isFailure) {
    return <ErrorState title="Failed to load services" description="We couldn't load the services right now. Please try again later." />;
  }

  const catalog = catalogResult.value.data;
  
  const page = pageResult.isSuccess ? pageResult.value : null;
  let content: ServicesPageContent | null = null;
  
  if (page?.publishedContent) {
    try {
      content = JSON.parse(page.publishedContent);
    } catch (e) {
      console.error('Failed to parse published CMS content for services page', e);
    }
  }

  // Resolve Images & Map Content
  const isHeroVisible = content?.hero?.isVisible ?? true;
  const heroData = {
    title: content?.hero?.title || 'Our Services',
    description: content?.hero?.description || 'Comprehensive healthcare services tailored to your needs. From diagnostic imaging to specialized consultations.',
    image: await resolveImageUrl(content?.hero?.image) || '/images/services_hero_pic.png',
  };

  const isTrustVisible = content?.trustFeatures?.isVisible ?? true;
  const trustFeaturesData = content?.trustFeatures?.items || defaultTrustBarData;

  const isCatalogVisible = content?.catalog?.isVisible ?? true;

  const isBottomCtaVisible = content?.bottomCta?.isVisible ?? true;
  const bottomCtaData = {
    title: content?.bottomCta?.title || 'Need a diagnostic test?',
    description: content?.bottomCta?.description || 'Walk-in today or book an appointment for home collection. Get accurate results with NABL-accredited quality.',
    primaryActionLabel: content?.bottomCta?.primaryActionLabel || 'Book Appointment',
    primaryActionLink: content?.bottomCta?.primaryActionLink || '/book',
    secondaryActionLabel: content?.bottomCta?.secondaryActionLabel || 'Call Now',
    secondaryActionLink: content?.bottomCta?.secondaryActionLink || 'tel:1800-123-4567',
  };

  return (
    <>
      {isHeroVisible && <ServicesHeroSection data={heroData} />}
      
      {isTrustVisible && <TrustBar data={trustFeaturesData} style={{ marginTop: 'calc(-1 * var(--sp-8))', position: 'relative', zIndex: 10 }} />}
      
      {isCatalogVisible && (
        catalog.length > 0 ? (
          <ServicesCatalogSection data={catalog} />
        ) : (
          <EmptyState title="No services found" description="Check back later." />
        )
      )}

      {isBottomCtaVisible && (
        <CTASection 
          title={bottomCtaData.title}
          description={bottomCtaData.description}
          primaryActionLabel={bottomCtaData.primaryActionLabel}
          primaryActionHref={bottomCtaData.primaryActionLink}
          secondaryActionLabel={bottomCtaData.secondaryActionLabel}
          secondaryActionHref={bottomCtaData.secondaryActionLink}
          className="section--alt"
        />
      )}
    </>
  );
}
`;

fs.writeFileSync(path.join(process.cwd(), 'app', '(public)', 'services', 'page.tsx'), code, 'utf8');
console.log("Created public services page");
