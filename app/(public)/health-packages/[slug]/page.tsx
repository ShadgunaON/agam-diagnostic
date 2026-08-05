import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CTASection } from '@/components/common';
import { PackageDetailContent, PackageDetailSidebar } from '@/components/sections/packages';
import { packageService } from '@/services';
import { siteConfig } from '@/config/site';

interface PackageDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const result = await packageService.getCatalog(1, 100);
  if (result.isFailure) return [];
  return result.value.data.map((pkg) => ({
    slug: pkg.slug,
  }));
}

export async function generateMetadata({ params }: PackageDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await packageService.getPackageBySlug(slug);
  if (result.isFailure) return { title: 'Package Not Found' };

  return {
    title: `${result.value.title} | ${siteConfig.name}`,
    description: result.value.description,
  };
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { slug } = await params;
  const result = await packageService.getPackageBySlug(slug);

  if (result.isFailure) {
    notFound();
  }

  const pkg = result.value;

  return (
    <>
      <section className="section pb-0">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb__sep">›</span>
            <Link href="/health-packages">Health Packages</Link>
            <span className="breadcrumb__sep">›</span>
            <span className="breadcrumb__current">{pkg.title}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="detail-layout">
            <PackageDetailContent data={pkg} />
            <PackageDetailSidebar highlights={pkg.highlights} />
          </div>
        </div>
      </section>

      <CTASection 
        className="section--alt"
        title="Ready to book your health checkup?"
        description="Walk-in or book online for free home collection."
        primaryActionLabel="Book Now"
      />
    </>
  );
}
