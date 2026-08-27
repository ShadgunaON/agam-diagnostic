import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CTASection } from '@/components/common';
import { TestDetailContent } from '@/components/sections/tests';
import { testCatalogService } from '@/services';
import { siteConfig } from '@/config/site';

interface TestDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const result = await testCatalogService.getCatalog(1, 100);
  if (result.isFailure) {
    console.error("CRITICAL BUILD ERROR in tests/generateStaticParams:", result.error);
    throw new Error(`Failed to fetch catalog: ${result.error?.message || result.error || 'Unknown error'}`);
  }
  
  return result.value.data.map((test) => ({
    slug: test.slug,
  }));
}

export async function generateMetadata({ params }: TestDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await testCatalogService.getTestBySlug(slug);
  if (result.isFailure) return { title: 'Test Not Found' };

  return {
    title: `${result.value.title} | ${siteConfig.name}`,
    description: result.value.description,
  };
}

export default async function TestDetailPage({ params }: TestDetailPageProps) {
  const { slug } = await params;
  const result = await testCatalogService.getTestBySlug(slug);

  if (result.isFailure) {
    notFound();
  }

  const testData = result.value;

  return (
    <>
      <section className="section pb-0">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb__sep">›</span>
            <Link href="/tests">Lab Tests</Link>
            <span className="breadcrumb__sep">›</span>
            <span className="breadcrumb__current">{testData.title}</span>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 'var(--sp-4)' }}>
        <div className="container">
          <div className="max-w-[900px] mx-auto w-full">
            <TestDetailContent data={testData} />
          </div>
        </div>
      </section>

      <CTASection 
        className="section--alt"
        title="Need help interpreting your test?"
        description="Book a free consultation with our health experts to understand your requirements."
        primaryActionLabel="Contact Us"
      />
    </>
  );
}
