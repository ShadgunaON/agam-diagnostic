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
        
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--color-bg-alt) 0%, var(--color-bg-alt) 2%, transparent 15%)', zIndex: 1 }}></div>
          <Image 
            src={data.image} 
            alt={data.title} 
            fill
            className="object-cover"
            style={{ objectPosition: '20% center', borderRadius: 0 }}
            unoptimized
          />
        </div>
      </div>
    </section>
  );
}
