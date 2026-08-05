import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CTASection } from '@/components/common';
import { Section, Container, Grid } from '@/components/ui';
import { ServiceDetailContent, ServiceDetailSidebar } from '@/components/sections/services';
import { serviceCatalogService } from '@/services';
import { siteConfig } from '@/config/site';

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const result = await serviceCatalogService.getCatalog(1, 100);
  if (result.isFailure) return [];
  return result.value.data.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await serviceCatalogService.getServiceBySlug(slug);
  if (result.isFailure) return { title: 'Service Not Found' };

  return {
    title: `${result.value.title} | ${siteConfig.name}`,
    description: result.value.shortDescription,
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  const result = await serviceCatalogService.getServiceBySlug(slug);

  if (result.isFailure) {
    notFound();
  }

  const service = result.value;

  return (
    <>
      <Section className="pb-0 pt-8">
        <Container>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="mx-1">›</span>
            <Link href="/services" className="hover:text-primary transition-colors">Services</Link>
            <span className="mx-1">›</span>
            <span className="text-primary font-bold">{service.title}</span>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Grid gap="12" className="grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ServiceDetailContent data={service} />
            </div>
            <div className="lg:col-span-1">
              <ServiceDetailSidebar otherServices={service.otherServices} />
            </div>
          </Grid>
        </Container>
      </Section>

      <CTASection 
        title="Ready to book your diagnostic test?"
        description="Walk-in today or book online. Free home sample collection available across Madurai."
        primaryActionLabel="Book Appointment"
      />
    </>
  );
}
