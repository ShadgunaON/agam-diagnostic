const fs = require('fs');
const path = require('path');

const code = `import React from 'react';
import { pageService } from '@/services/PageService';
import { MediaService } from '@/services/MediaService';
import { serviceCatalogService } from '@/services/ServiceCatalogService';
import { ServicesPageContent } from '@/domains/cms/models';

import { ServicesHeroSection, ServicesCatalogSection } from '@/components/sections/services';
import { CTASection } from '@/components/common';
import { TrustBarSection as TrustBar } from '@/components/sections/about';
import { ErrorState, EmptyState } from '@/components/common';
import { AdminAuthGuard } from '@/components/admin/auth/AdminAuthGuard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function resolveImageUrl(url: string | undefined): Promise<string | undefined> {
  if (!url) return undefined;
  if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('/')) {
    try {
      return await MediaService.getDownloadUrl(url);
    } catch (e) {
      console.error('[ServicesPreview] Failed to fetch presigned URL for image:', e);
      return url;
    }
  }
  return url;
}

// Default fallback data for preview if no draft exists
const defaultTrustBarData = [
  { title: "NABL Accredited", description: "Highest quality standards", icon: "ShieldCheck" },
  { title: "Fastest Reports", description: "Same day delivery online", icon: "Clock" },
  { title: "Free Home Collection", description: "Available across Madurai", icon: "Home" },
  { title: "24/7 Support", description: "Call or WhatsApp anytime", icon: "Phone" }
];

async function ServicesPreviewPage() {
  const [pageResult, catalogResult] = await Promise.all([
    pageService.getPageById('services'),
    serviceCatalogService.getCatalog(1, 100),
  ]);

  const page = pageResult.isSuccess ? pageResult.value : null;
  let content: ServicesPageContent | null = null;
  
  if (page?.draftContent) {
    try {
      content = JSON.parse(page.draftContent);
    } catch (e) {
      console.error('Failed to parse draft CMS content for services page', e);
    }
  } else if (page?.publishedContent) {
    try {
      content = JSON.parse(page.publishedContent);
    } catch (e) {
      console.error('Failed to parse published CMS content for services page', e);
    }
  }

  // If no content, just show a blank state
  if (!content) {
    return <div className="p-12 text-center text-gray-500">No Draft Content Found</div>;
  }

  const catalog = catalogResult.isSuccess ? catalogResult.value.data : [];

  // Resolve Images & Map Content
  const isHeroVisible = content.hero?.isVisible ?? true;
  const heroData = {
    title: content.hero?.title || 'Our Services',
    description: content.hero?.description || 'Comprehensive healthcare services tailored to your needs. From diagnostic imaging to specialized consultations.',
    image: await resolveImageUrl(content.hero?.image) || '/images/services_hero_pic.png',
  };

  const isTrustVisible = content.trustFeatures?.isVisible ?? true;
  const trustFeaturesData = content.trustFeatures?.items || defaultTrustBarData;

  const isCatalogVisible = content.catalog?.isVisible ?? true;

  const isBottomCtaVisible = content.bottomCta?.isVisible ?? true;
  const bottomCtaData = {
    title: content.bottomCta?.title || 'Need a diagnostic test?',
    description: content.bottomCta?.description || 'Walk-in today or book an appointment for home collection. Get accurate results with NABL-accredited quality.',
    primaryActionLabel: content.bottomCta?.primaryActionLabel || 'Book Appointment',
    primaryActionLink: content.bottomCta?.primaryActionLink || '/book',
    secondaryActionLabel: content.bottomCta?.secondaryActionLabel || 'Call Now',
    secondaryActionLink: content.bottomCta?.secondaryActionLink || 'tel:1800-123-4567',
  };

  return (
    <div className="preview-container bg-white">
      <div className="bg-amber-100 text-amber-800 text-center text-sm py-2 font-medium sticky top-0 z-50 shadow">
        ADMIN PREVIEW MODE - You are viewing the Draft content.
      </div>
      <main className="flex min-h-screen flex-col w-full">
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
      </main>
    </div>
  );
}

export default function ProtectedServicesPreviewPage() {
  return (
    <AdminAuthGuard>
      <ServicesPreviewPage />
    </AdminAuthGuard>
  );
}
`;

fs.mkdirSync(path.join(process.cwd(), 'app', '(public)', 'preview', 'services'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), 'app', '(public)', 'preview', 'services', 'page.tsx'), code, 'utf8');
console.log("Created services preview page");
