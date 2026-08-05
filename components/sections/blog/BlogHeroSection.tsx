import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui';

export interface BlogHeroSectionProps {
  title: string;
  description: string;
  className?: string;
}

export function BlogHeroSection({ title, description, className = '' }: BlogHeroSectionProps) {
  return (
    <section className={`page-hero page-hero--inner ${className}`}>
      <Container>
        <div className="breadcrumb mb-4">
          <Link href="/">Home</Link>
          <span className="breadcrumb__sep">›</span>
          <span className="breadcrumb__current">Blog</span>
        </div>
        <h1 className="page-hero__title text-4xl font-bold mb-4">{title}</h1>
        <p className="page-hero__desc text-lg opacity-90 max-w-2xl">{description}</p>
      </Container>
    </section>
  );
}
