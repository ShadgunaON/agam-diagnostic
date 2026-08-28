import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/config/site';
import { testCatalogService } from '@/services';
import { CTASection, ErrorState, EmptyState } from '@/components/common';
import { TestsCatalogSection } from '@/components/sections/tests';
import { TrustBarSection } from '@/components/sections/about/TrustBarSection';

export const revalidate = 60;

export const metadata: Metadata = {
  title: `Genetic Tests | ${siteConfig.name}`,
  description: 'Advanced genetic testing and molecular diagnostics. NABL-accredited precision medicine with expert counseling.',
};

export default async function GeneticTestsPage() {
  const [categoriesResult, catalogResult] = await Promise.all([
    testCatalogService.getCategories(),
    testCatalogService.getCatalog(1, 100),
  ]);

  if (categoriesResult.isFailure || catalogResult.isFailure) {
    return <ErrorState title="Failed to load genetic tests" description="We couldn't load the tests right now. Please try again later." />;
  }

  // Filter for genetic tests only
  const allTests = catalogResult.value.data;
  const geneticTests = allTests.filter((test: any) => test.category === 'genetics' || test.tag === 'Genetic Test' || test.category === 'molecular');

  return (
    <>
      <section className="hero-premium section !p-0 overflow-hidden relative" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="flex flex-col lg:grid lg:grid-cols-[45%_55%] items-stretch lg:h-[calc(100vh-90px)] lg:max-h-[640px] lg:min-h-[480px]">
          <div className="flex flex-col justify-start relative z-10 px-6 py-10 lg:pt-12 lg:pb-10 lg:pl-[max(1.5rem,calc((100vw-var(--max-width))/2+1.5rem))] lg:pr-12">
            <div className="breadcrumb" style={{ marginBottom: 'var(--sp-3)' }}>
              <Link href="/">Home</Link><span className="breadcrumb__sep">›</span><Link href="/tests">Tests</Link><span className="breadcrumb__sep">›</span><span className="breadcrumb__current">Genetic Tests</span>
            </div>
            <span className="hero-premium__pill">Precision Diagnostics</span>
            <h1 className="hero-premium__title" style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.125rem)', lineHeight: 1.2, fontWeight: 800, marginBottom: 'var(--sp-3)' }}>Advanced Genetic Testing & Molecular Diagnostics</h1>
            <p className="hero-premium__desc" style={{ fontSize: 'var(--fs-base)', color: 'var(--color-text)', marginBottom: 'var(--sp-5)', lineHeight: 'var(--lh-relaxed)', maxWidth: '480px' }}>Unlock insights into your DNA. From hereditary cancer screening to carrier testing, our genetic panels provide accurate, actionable health information.</p>
            <div>
              <Button href="#genetic-tests-grid" className="btn btn--primary">
                View Genetic Tests
              </Button>
            </div>
          </div>
          <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-auto lg:h-full flex items-center justify-center overflow-hidden">
            <div className="hidden lg:block absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, var(--color-bg-alt) 0%, transparent 15%)' }}></div>
            <img src="/images/hero_lab_visual.png" alt="Genetic Testing" className="w-full h-full object-cover object-top md:object-[20%_center] lg:object-center rounded-2xl lg:rounded-none" />
          </div>
        </div>
      </section>

      <TrustBarSection 
        data={[
          { title: 'NABL Accredited', description: 'Highest quality standards', icon: 'shield' },
          { title: 'Precision Medicine', description: 'Advanced genomic insights', icon: 'activity' },
          { title: 'Expert Counseling', description: 'Post-test guidance', icon: 'phone' },
          { title: 'Data Privacy', description: 'Strict confidentiality', icon: 'lock' }
        ]}
        style={{ position: 'relative', zIndex: 10, marginTop: '-40px' }} 
      />
      
      <section id="genetic-tests-grid" className="section">
        {geneticTests.length > 0 ? (
          <TestsCatalogSection 
            catalog={geneticTests} 
            categories={categoriesResult.value.filter((c: any) => c.id === 'genetics' || c.id === 'molecular')} 
          />
        ) : (
          <EmptyState title="No genetic tests found" description="Check back later." />
        )}
      </section>
      
      <CTASection 
        title="Need help choosing a genetic test?"
        description="Our experts can guide you based on your family history and health goals."
        primaryActionLabel="Contact Us"
        className="section--alt"
      />
    </>
  );
}
