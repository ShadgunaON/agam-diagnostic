import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

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
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection data={heroData} />
      <StatisticsSection data={statisticsData} />
      <ServicesSection data={servicesData} />
      <HealthPackagesSection data={packagesData} />
      <TestimonialsSection data={testimonialsData} />
      <WhyChooseUsSection data={whyChooseUsData} />
      <BlogPreviewSection data={blogPreviewData} />
      <ContactPreviewSection data={contactData} />
      <FAQSection data={faqData} />
      <CTASection 
        title="Ready to Book Your Test?"
        description="Choose what works best for you. Visit a nearby lab or let our experts come to you."
        primaryActionLabel="Start Booking"
      />
    </>
  );
}
