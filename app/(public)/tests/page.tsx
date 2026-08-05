import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { testCatalogService } from '@/services';
import { TestsHeroSection, TestsCatalogSection } from '@/components/sections/tests';
import { CTASection, ErrorState, EmptyState } from '@/components/common';
import { TrustBarSection } from '@/components/sections/about/TrustBarSection';

export const metadata: Metadata = {
  title: `Lab Tests | ${siteConfig.name}`,
  description: 'Book reliable blood tests and health checkups. NABL-accredited results with free home collection across Madurai.',
};

export default async function TestsPage() {
  const [heroResult, categoriesResult, catalogResult] = await Promise.all([
    testCatalogService.getHeroData(),
    testCatalogService.getCategories(),
    testCatalogService.getCatalog(1, 100),
  ]);

  if (heroResult.isFailure || categoriesResult.isFailure || catalogResult.isFailure) {
    return <ErrorState title="Failed to load tests" description="We couldn't load the tests right now. Please try again later." />;
  }

  const catalog = catalogResult.value.data;

  return (
    <>
      <TestsHeroSection data={heroResult.value} />
      <TrustBarSection 
        data={[
          { title: 'NABL Accredited', description: 'Highest quality standards', icon: 'shield' },
          { title: 'Fastest Reports', description: 'Same day delivery online', icon: 'clock' },
          { title: 'Free Home Collection', description: 'Available across Madurai', icon: 'home' },
          { title: '24/7 Support', description: 'Call or WhatsApp anytime', icon: 'phone' }
        ]}
        style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }} 
      />
      
      {catalog.length > 0 ? (
        <TestsCatalogSection 
          catalog={catalog} 
          categories={categoriesResult.value} 
        />
      ) : (
        <EmptyState title="No tests found" description="Check back later." />
      )}
      
      <CTASection 
        title="Can't find the test you're looking for?"
        description="Upload your prescription and our experts will guide you."
        primaryActionLabel="Contact Us"
        className="section--alt"
      />
    </>
  );
}
