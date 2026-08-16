import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Section, Container, Typography, Grid } from '@/components/ui';

export interface AboutHeroSectionProps {
  data: {
    title: string;
    description: string;
    image: string;
    badges: string[];
  };
  className?: string;
}

export function AboutHeroSection({ data, className = '' }: AboutHeroSectionProps) {
  return (
    <section className={`hero-premium section ${className}`} style={{ padding: 0, background: 'var(--color-bg-alt)', overflow: 'hidden', position: 'relative' }}>
      <div className="grid grid-cols-1 md:grid-cols-[45%_55%] items-stretch">
        
        {/* Content Left */}
        <div className="flex flex-col justify-center relative z-10 px-6 py-6 md:py-8 md:pl-[max(1.5rem,calc((100vw-var(--max-width))/2+1.5rem))] md:pr-8">
          <div className="breadcrumb" style={{ marginBottom: 'var(--sp-4)' }}>
            <Link href="/">Home</Link><span className="breadcrumb__sep">›</span><span className="breadcrumb__current">About Us</span>
          </div>
          <h1 className="hero-premium__title" style={{ fontSize: 'var(--fs-4xl)', marginBottom: 'var(--sp-4)' }}>{data.title}</h1>
          <p className="hero-premium__desc" style={{ fontSize: 'var(--fs-lg)', color: 'var(--color-text)', marginBottom: 'var(--sp-6)', lineHeight: 'var(--lh-relaxed)', maxWidth: '480px' }}>
            {data.description}
          </p>
          
          <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
            {data.badges.map((badge: string, idx: number) => {
              // Extract the appropriate icon based on the badge string since HTML had specific icons
              let icon = <polyline points="20 6 9 17 4 12"/>;
              if (badge.includes("Trusted")) {
                icon = <><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>;
              }
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--color-primary)', background: '#fff', padding: '16px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', minWidth: '140px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                      {icon}
                    </svg>
                  </div>
                  {badge}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Image Right */}
        <div className="relative w-full aspect-[4/3] sm:aspect-video md:aspect-auto md:h-full md:min-h-[400px] flex items-center justify-center overflow-hidden">
          <div className="hidden md:block absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, var(--color-bg-alt) 0%, transparent 20%)' }}></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={data.image} 
            alt="AGAM Diagnostics Team" 
            className="w-full h-full object-cover object-top md:object-center rounded-2xl md:rounded-none"
          />
        </div>
        
      </div>
    </section>
  );
}
