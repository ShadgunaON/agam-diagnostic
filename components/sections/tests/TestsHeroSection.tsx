import React from 'react';
import Link from 'next/link';

export interface TestsHeroSectionProps {
  data: {
    title: string;
    description: string;
    image: string;
  };
  className?: string;
}

export function TestsHeroSection({ data, className = '' }: TestsHeroSectionProps) {
  return (
    <section className={`hero-premium section !p-0 overflow-hidden relative ${className}`.trim()} style={{ background: 'var(--color-bg-alt)' }}>
      <div className="flex flex-col lg:grid lg:grid-cols-[45%_55%] xl:grid-cols-[40%_60%] items-stretch">
        <div className="flex flex-col justify-center relative z-10 px-6 py-4 lg:py-6 lg:pl-[max(1.5rem,calc((100vw-var(--max-width))/2+1.5rem))] lg:pr-8">
          <div className="breadcrumb" style={{ marginBottom: 'var(--sp-4)' }}>
            <Link href="/">Home</Link>
            <span className="breadcrumb__sep">›</span>
            <span className="breadcrumb__current">Health Tests</span>
          </div>
          <h1 className="hero-premium__title" style={{ fontSize: 'var(--fs-3xl)' }}>{data.title}</h1>
          <p className="hero-premium__desc" style={{ fontSize: 'var(--fs-base)', marginBottom: 'var(--sp-6)' }}>
            {data.description}
          </p>
          <div>
            <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
              <Link href="/book" className="btn btn--primary inline-flex">
                Book Home Collection
              </Link>
              <Link href="/genetic-tests" className="btn btn--outline inline-flex">
                Explore Genetic Tests
              </Link>
            </div>
          </div>
        </div>
        
        <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-auto lg:h-full lg:min-h-[350px] flex items-center justify-center overflow-hidden">
          <div className="hidden lg:block absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, var(--color-bg-alt) 0%, transparent 15%)' }}></div>
          <img 
            src="/images/indian_lab_technician_tests.png" 
            alt={data.title} 
            className="w-full h-full object-cover lg:object-[left_center]"
          />
        </div>
      </div>
    </section>
  );
}
