import React from 'react';
import { Metadata } from 'next';
import { CTASection, ErrorState } from '@/components/common';
import { 
  PackagesHeroSection, 
  PackagesBenefitsSection,
  PackagesProcessSection,
  PackagesCategorySection,
  PackagesFeaturedSection,
  PackagesAdvantageSection
} from '@/components/sections/packages';
import { packageService, pageService } from '@/services';
import { siteConfig } from '@/config/site';
import { HealthPackagesPageContent } from '@/domains/cms/models';
import { AdminAuthGuard } from '@/components/admin/layout/AdminAuthGuard';


export default async function HealthPackagesPage() {
  let content: HealthPackagesPageContent | null = null;
  
  try {
    const pageData = await pageService.getPageById('health-packages');
    if (pageData) {
      const raw = pageData.draftContent;
      if (raw) {
        content = JSON.parse(raw) as HealthPackagesPageContent;
      }
    }
  } catch (err) {
    console.error('Failed to load health packages page content', err);
  }

  // Fallback data if no CMS content
  const fallbackHero = await packageService.getHeroData();
  const fallbackBenefits = await packageService.getBenefits();
  const fallbackProcess = await packageService.getProcessSteps();
  const fallbackFeatured = await packageService.getFeaturedPackages();

  const heroData = content?.hero || (fallbackHero.isSuccess ? fallbackHero.value : null);
  const benefitsData = content?.benefits || { items: fallbackBenefits.isSuccess ? fallbackBenefits.value : [] };
  const processData = content?.process || { steps: fallbackProcess.isSuccess ? fallbackProcess.value : [] };
  
  let featuredPackages = fallbackFeatured.isSuccess ? fallbackFeatured.value : [];

  if (content?.featured?.packageIds && content.featured.packageIds.length > 0) {
    // Note: To avoid overfetching or unbounded reads, we use the catalog fetch limit. 
    // In a real optimized scenario, we'd add a getPackagesByIds to packageService.
    const res = await packageService.getCatalog(1, 100);
    if (res.isSuccess && res.value?.data) {
      const allPkgs = res.value.data;
      const matched = content.featured.packageIds
        .map(id => allPkgs.find(p => p.id === id))
        .filter(Boolean);
        
      featuredPackages = matched.map(pkg => ({
        id: pkg!.id,
        slug: pkg!.slug,
        title: pkg!.title,
        category: pkg!.category || 'Health Package',
        price: String(pkg!.price ?? pkg!.packagePrice ?? 0),
        individualValue: pkg!.individualValue ?? 0,
        description: pkg!.description || '',
        testCount: pkg!.testIds?.length ?? 0,
        ageGroups: [],
        highlightText: '',
        benefit: '',
        badgeText: '',
        badgeColor: '',
        highlightIcon: ''
      }));
    }
  }

  const pageContent = (
    <>
      {(!content || content.hero?.isVisible !== false) && (
        <PackagesHeroSection data={heroData as any} />
      )}
      
      {(!content || content.preventiveCare?.isVisible !== false || content.benefits?.isVisible !== false) && (
        <PackagesBenefitsSection data={{
          title: content?.preventiveCare?.title,
          description: content?.preventiveCare?.description,
          eyebrow: content?.preventiveCare?.eyebrow,
          items: benefitsData.items
        }} />
      )}
      
      {(!content || content.process?.isVisible !== false) && (
        <PackagesProcessSection data={{
          title: content?.process?.title,
          description: content?.process?.description,
          eyebrow: content?.process?.eyebrow,
          steps: processData.steps
        }} />
      )}
      
      {(!content || content.category?.isVisible !== false) && (
        <PackagesCategorySection data={content?.category} />
      )}
      
      {(!content || content.featured?.isVisible !== false) && (
        <PackagesFeaturedSection 
          title={content?.featured?.title}
          subtitle={content?.featured?.description}
          eyebrow={content?.featured?.eyebrow}
          data={featuredPackages} 
        />
      )}
      
      {(!content || content.advantage?.isVisible !== false) && (
        <PackagesAdvantageSection data={content?.advantage} />
      )}
      
      {(!content || content.bottomCta?.isVisible !== false) && (
        <CTASection 
          className="section--alt"
          title={content?.bottomCta?.title || "Not sure which package is right for you?"}
          description={content?.bottomCta?.description || "Our diagnostic experts can help you choose the right health package based on your age, medical history, and health goals."}
          primaryActionLabel={content?.bottomCta?.primaryActionLabel || "Book a Free Consultation"}
          secondaryActionLabel={content?.bottomCta?.secondaryActionLabel || "Call: +91 89408 94079"}
        />
      )}
    </>
  );

  return <AdminAuthGuard>{pageContent}</AdminAuthGuard>;
}
