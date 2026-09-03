import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CTASection } from '@/components/common';
import { PackageDetailContent } from '@/components/sections/packages';
import { packageService } from '@/services';
import { siteConfig } from '@/config/site';

// Revalidate every 60 s so admin edits appear without a full redeploy
export const revalidate = 60;
// Allow paths not pre-rendered at build time to be served on demand
export const dynamicParams = true;

interface PackageDetailPageProps {
  params: Promise<{ slug: string }>;
}


export async function generateStaticParams() {
  try {
    const result = await packageService.getCatalog(1, 100);
    if (result.isFailure) return [];
    return result.value.data.map((pkg) => ({
      slug: pkg.slug,
    }));
  } catch {
    return [];
  }
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
          <div className="max-w-[900px] mx-auto w-full">
            <PackageDetailContent data={pkg} />
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
