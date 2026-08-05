import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { serviceCatalogService } from '@/services';
import { ServicesHeroSection, ServicesCatalogSection } from '@/components/sections/services';
import { CTASection } from '@/components/common';
import { TrustBarSection as TrustBar } from '@/components/sections/about';
import { ErrorState, EmptyState } from '@/components/common';

export const metadata: Metadata = {
  title: `Clinical & Diagnostic Services | ${siteConfig.name}`,
  description: 'Explore our comprehensive range of clinical and diagnostic services.',
};

const trustBarData = [
  { title: "NABL Accredited", description: "Highest quality standards", icon: "shield" },
  { title: "Fastest Reports", description: "Same day delivery online", icon: "clock" },
  { title: "Free Home Collection", description: "Available across Madurai", icon: "home" },
  { title: "24/7 Support", description: "Call or WhatsApp anytime", icon: "phone" }
];

export default async function ServicesPage() {
  const [heroResult, catalogResult] = await Promise.all([
    serviceCatalogService.getHeroData(),
    serviceCatalogService.getCatalog(1, 100),
  ]);

  if (heroResult.isFailure || catalogResult.isFailure) {
    return <ErrorState title="Failed to load services" description="We couldn't load the services right now. Please try again later." />;
  }

  const catalog = catalogResult.value.data;

  return (
    <>
      <ServicesHeroSection data={heroResult.value} />
      <TrustBar data={trustBarData} />
      {catalog.length > 0 ? (
        <ServicesCatalogSection data={catalog} />
      ) : (
        <EmptyState title="No services found" description="Check back later." />
      )}
      <CTASection 
        title="Need a diagnostic test?"
        description="Walk-in today or book an appointment for home collection. Get accurate results with NABL-accredited quality."
        primaryActionLabel="Book Appointment"
        secondaryActionLabel="Call Now"
        className="section--alt"
      />
    </>
  );
}
