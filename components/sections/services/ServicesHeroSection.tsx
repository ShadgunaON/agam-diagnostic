import React from 'react';
import Link from 'next/link';
import { Section, Container, Grid } from '@/components/ui';
import { Button } from '@/components/ui/Button';

export interface ServicesHeroSectionProps {
  data: {
    title: string;
    description: string;
    image: string;
  };
  className?: string;
}

export function ServicesHeroSection({ data, className = '' }: ServicesHeroSectionProps) {
  return (
    <Section 
      className={`hero-premium section ${className}`.trim()}
      style={{ padding: 0, background: 'var(--color-bg-alt)', overflow: 'hidden', position: 'relative' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-[45%_55%] items-stretch">
        
        {/* Content Left */}
        <div className="flex flex-col justify-center relative z-10 px-6 py-4 md:py-6 md:pl-[max(1.5rem,calc((100vw-var(--max-width))/2+1.5rem))] md:pr-8">
          <div className="breadcrumb" style={{ marginBottom: 'var(--sp-3)' }}>
            <Link href="/">Home</Link><span className="breadcrumb__sep">›</span><span className="breadcrumb__current">Diagnostic Services</span>
          </div>
          <h1 className="hero-premium__title" style={{ fontSize: 'var(--fs-3xl)', marginBottom: 'var(--sp-3)' }}>{data.title}</h1>
          <p className="hero-premium__desc" style={{ fontSize: 'var(--fs-base)', color: 'var(--color-text)', marginBottom: 'var(--sp-5)', lineHeight: 'var(--lh-relaxed)', maxWidth: '480px' }}>
            {data.description}
          </p>
        </div>

        {/* Image Right */}
        <div className="relative w-full aspect-video md:aspect-auto md:h-full md:min-h-[300px] flex items-center justify-center overflow-hidden">
          {/* Organic white gradient overlay to blend left and right (hidden on mobile) */}
          <div className="hidden md:block absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, var(--color-bg-alt) 0%, transparent 15%)' }}></div>
          <img src={data.image} alt="Diagnostic Services" className="w-full h-full object-cover object-top md:object-[20%_center] lg:object-center" />
        </div>
        
      </div>
    </Section>
  );
}
