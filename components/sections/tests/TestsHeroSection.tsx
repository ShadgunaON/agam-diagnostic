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
    <section className={`hero-split ${className}`.trim()}>
      <div className="container">
        <div className="hero-split__inner">
          <div className="hero-premium__content">
            <div className="breadcrumb" style={{ marginBottom: 'var(--sp-4)' }}>
              <Link href="/">Home</Link>
              <span className="breadcrumb__sep">›</span>
              <span className="breadcrumb__current">Health Tests</span>
            </div>
            <h1 className="hero-premium__title" style={{ fontSize: 'var(--fs-3xl)' }}>{data.title}</h1>
            <p className="hero-premium__desc" style={{ fontSize: 'var(--fs-base)', marginBottom: 'var(--sp-6)' }}>
              {data.description}
            </p>
            <Link href="/book" className="btn btn--primary">
              Book Home Collection
            </Link>
          </div>
          <div className="hero-image-wrap hide-mobile">
            <img src={data.image} alt={data.title} />
          </div>
        </div>
      </div>
    </section>
  );
}
