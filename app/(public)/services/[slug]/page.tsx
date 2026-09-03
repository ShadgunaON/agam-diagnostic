import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CTASection } from '@/components/common';
import { Section, Container, Grid } from '@/components/ui';
import { ServiceDetailContent } from '@/components/sections/services';
import { serviceCatalogService } from '@/services';
import { siteConfig } from '@/config/site';

// Revalidate every 60 s so admin edits appear without a full redeploy
export const revalidate = 60;
// Allow paths not pre-rendered at build time to be served on demand
export const dynamicParams = true;

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}


export async function generateStaticParams() {
  try {
    const result = await serviceCatalogService.getCatalog(1, 100);
    if (result.isFailure) return [];
    return result.value.data.map((service) => ({
      slug: service.slug,
    }));
  } catch {
    return [];
  }
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
      <div className="container" style={{ paddingTop: 'var(--sp-6)', paddingBottom: 'var(--sp-2)' }}>
        <div className="breadcrumb" style={{ margin: 0 }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb__sep">›</span>
          <Link href="/services">Services</Link>
          <span className="breadcrumb__sep">›</span>
          <span className="breadcrumb__current">{service.title}</span>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 'var(--sp-4)' }}>
        <div className="container">
          <div className="max-w-[900px] mx-auto w-full">
            <ServiceDetailContent data={service} />
          </div>
        </div>
      </section>

      <CTASection 
        title="Ready to book your diagnostic test?"
        description="Walk-in today or book online. Free home sample collection available across Madurai."
        primaryActionLabel="Book Appointment"
      />
    </>
  );
}
