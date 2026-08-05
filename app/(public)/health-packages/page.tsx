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
import { packageService } from '@/services';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `Health Packages — Preventive Health Checkups | ${siteConfig.name}`,
  description: 'Explore NABL-accredited health packages at Agam Diagnostics, Madurai. Comprehensive checkups for women, men & lifestyle wellness with free home collection.',
};

export default async function HealthPackagesPage() {
  const [heroResult, benefitsResult, processResult, featuredResult] = await Promise.all([
    packageService.getHeroData(),
    packageService.getBenefits(),
    packageService.getProcessSteps(),
    packageService.getFeaturedPackages(),
  ]);

  if (heroResult.isFailure || benefitsResult.isFailure || processResult.isFailure || featuredResult.isFailure) {
    return <ErrorState title="Failed to load packages" description="We couldn't load the health packages right now. Please try again later." />;
  }

  return (
    <>
      <PackagesHeroSection data={heroResult.value} />
      <PackagesBenefitsSection data={benefitsResult.value} />
      <PackagesProcessSection data={processResult.value} />
      <PackagesCategorySection />
      <PackagesFeaturedSection data={featuredResult.value} />
      <PackagesAdvantageSection />
      <CTASection 
        className="section--alt"
        title="Not sure which package is right for you?"
        description="Our diagnostic experts can help you choose the right health package based on your age, medical history, and health goals."
        primaryActionLabel="Book a Free Consultation"
        secondaryActionLabel="Call: +91 89408 94079"
      />
    </>
  );
}
