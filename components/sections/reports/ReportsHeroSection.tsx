import React from 'react';
import Link from 'next/link';

export interface ReportsHeroSectionProps {
  title: string;
  description: string;
  className?: string;
}

export function ReportsHeroSection({ title, description, className = '' }: ReportsHeroSectionProps) {
  return (
    <section className={`page-hero page-hero--inner bg-primary/5 ${className}`}>
      <div className="container">
        <div className="breadcrumb mb-4">
          <Link href="/">Home</Link>
          <span className="breadcrumb__sep">›</span>
          <span className="breadcrumb__current">Reports</span>
        </div>
        <h1 className="page-hero__title text-4xl font-bold mb-4">{title}</h1>
        <p className="page-hero__desc text-lg opacity-90 max-w-2xl">{description}</p>
      </div>
    </section>
  );
}
