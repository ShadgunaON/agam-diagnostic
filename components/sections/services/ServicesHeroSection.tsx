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
      <Grid style={{ gridTemplateColumns: '45% 55%', alignItems: 'stretch' }}>
        
        {/* Content Left */}
        <div style={{ padding: 'var(--sp-2) var(--sp-6) var(--sp-10) max(var(--sp-6), calc((100vw - var(--max-width)) / 2 + var(--sp-6)))', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <div className="breadcrumb" style={{ marginBottom: 'var(--sp-3)' }}>
            <Link href="/">Home</Link><span className="breadcrumb__sep">›</span><span className="breadcrumb__current">Diagnostic Services</span>
          </div>
          <h1 className="hero-premium__title" style={{ fontSize: 'var(--fs-3xl)', marginBottom: 'var(--sp-3)' }}>{data.title}</h1>
          <p className="hero-premium__desc" style={{ fontSize: 'var(--fs-base)', color: 'var(--color-text)', marginBottom: 'var(--sp-5)', lineHeight: 'var(--lh-relaxed)', maxWidth: '480px' }}>
            {data.description}
          </p>
        </div>

        {/* Image Right */}
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {/* Organic white gradient overlay to blend left and right */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--color-bg-alt) 0%, var(--color-bg-alt) 2%, transparent 15%)', zIndex: 1 }}></div>
          <img src={data.image} alt="Diagnostic Services" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '20% center', borderRadius: 0 }} />
        </div>
        
      </Grid>
    </Section>
  );
}
