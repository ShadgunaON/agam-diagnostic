import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Section } from '@/components/ui';
import { Button } from '@/components/ui/Button';

export interface PackagesHeroSectionProps {
  data: {
    title: string;
    description: string;
    image: string;
    pill: string;
  };
  className?: string;
}

export function PackagesHeroSection({ data, className = '' }: PackagesHeroSectionProps) {
  return (
    <section className={`hero-premium section ${className}`.trim()} style={{ padding: 0, background: 'var(--color-bg-alt)', overflow: 'hidden', position: 'relative' }}>
      <div className="grid grid-cols-1 md:grid-cols-[45%_55%] items-stretch">
        
        <div style={{ padding: 'var(--sp-2) var(--sp-6) var(--sp-10) max(var(--sp-6), calc((100vw - var(--max-width)) / 2 + var(--sp-6)))', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <div className="breadcrumb" style={{ marginBottom: 'var(--sp-3)' }}>
            <Link href="/">Home</Link><span className="breadcrumb__sep">›</span><span className="breadcrumb__current">Health Packages</span>
          </div>
          <span className="hero-premium__pill">
            {data.pill}
          </span>
          <h1 className="hero-premium__title" style={{ fontSize: 'var(--fs-3xl)', marginBottom: 'var(--sp-3)' }}>{data.title}</h1>
          <p className="hero-premium__desc" style={{ fontSize: 'var(--fs-base)', color: 'var(--color-text)', marginBottom: 'var(--sp-5)', lineHeight: 'var(--lh-relaxed)', maxWidth: '480px' }}>
            {data.description}
          </p>
          
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <Button href="#browse-category" className="btn btn--primary">
              Explore Packages
            </Button>
            <Button href="/book" className="btn btn--outline">
              Book Appointment
            </Button>
          </div>
        </div>
        
        <div className="relative w-full aspect-[4/3] sm:aspect-video md:aspect-auto md:h-full md:min-h-[400px] flex items-center justify-center overflow-hidden">
          <div className="hidden md:block absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, var(--color-bg-alt) 0%, transparent 15%)' }}></div>
          <Image 
            src={data.image} 
            alt={data.title} 
            fill
            className="w-full h-full object-cover object-top md:object-[20%_center] lg:object-center rounded-2xl md:rounded-none"
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}
