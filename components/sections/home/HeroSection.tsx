'use client';

import React from 'react';
import { HeroData } from '@/data/home';
import { Container } from '@/components/ui';

export interface HeroSectionProps {
  data: HeroData;
  className?: string;
}

/**
 * Home Hero — matches approved HTML wireframe index.html lines 143-188.
 *
 * Key wireframe details:
 * - bg: var(--color-bg-alt) = #F8FAFC with gradient overlay to hero image
 * - ::after: 120px white fade at bottom
 * - Grid: 55% / 45%
 * - Search tabs: rounded-top pill tabs (radius-lg top, bg rgba(255,255,255,0.6), active bg-primary)
 * - Search box: asymmetric radius (0 full full xl), shadow-premium, ACCENT RED circle button 56×56
 * - Hero features: 3 items below search (Home Collection, Accurate Results, Report in 4-24hrs)
 * - Hero image: opacity-0 (layout space only, bg image shows through)
 * - NO floating glassmorphic cards
 */
export function HeroSection({ data, className = '' }: HeroSectionProps) {
  return (
    <section className={`hero-premium section !p-0 overflow-hidden relative ${className}`.trim()} style={{ background: '#ffffff' }}>
      <div className="flex flex-col lg:grid lg:grid-cols-[55%_45%] items-stretch">
        {/* Left Column (Desktop) */}
        <div className="flex flex-col justify-center relative z-10 lg:py-8 lg:pl-[max(1.5rem,calc((100vw-var(--max-width))/2+1.5rem))] lg:pr-8 text-center lg:text-left">
          
          {/* Title Section */}
          <div className="hero-premium__content px-6 pt-12 pb-6 lg:p-0">
            <div className="hero-premium__pill">NABL Accredited / Trusted Diagnostics</div>
            <h1 className="hero-premium__title">
              Advanced Diagnostics<br />You Can <span>Trust</span>
            </h1>
            <p className="hero-premium__desc mx-auto lg:mx-0">
              Agam Diagnostics is Madurai&apos;s most trusted NABL accredited and ICMR approved fully automated pathology laboratory.
            </p>
          </div>

          {/* Mobile Image (Placed between Title and Search) */}
          <div className="lg:hidden relative w-full aspect-[4/3] sm:aspect-video flex items-center justify-center overflow-hidden">
            <img 
              src="/images/modern_lab_interior.png" 
              alt="Advanced Diagnostics at Agam Diagnostics Madurai" 
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Search & Features Section */}
          <div className="hero-premium__content px-6 pb-12 pt-8 lg:p-0 lg:mt-8">
            <div className="relative">
              <div className="hero-features flex overflow-x-auto pb-4 snap-x snap-mandatory">
                <div className="hero-feature reveal reveal-delay-1 snap-start">
                  <div className="hero-feature__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <div>
                    <span className="hero-feature__text">Home Collection</span>
                    <span className="hero-feature__sub">Safe &amp; Convenient</span>
                  </div>
                </div>
                <div className="hero-feature reveal reveal-delay-2 snap-start">
                  <div className="hero-feature__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                  </div>
                  <div>
                    <span className="hero-feature__text">Accurate Results</span>
                    <span className="hero-feature__sub">NABL Certified</span>
                  </div>
                </div>
                <div className="hero-feature reveal reveal-delay-3 snap-start">
                  <div className="hero-feature__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div>
                    <span className="hero-feature__text">Report in 4-24hrs</span>
                    <span className="hero-feature__sub">Digital &amp; Secure</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2 lg:hidden text-muted-foreground text-[10px] uppercase font-bold tracking-wider opacity-60">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 animate-pulse"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                <span>Swipe to view more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Image (Desktop Only) */}
        <div className="hidden lg:flex relative w-full h-full min-h-[600px] items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, #ffffff 0%, transparent 15%)' }}></div>
          <img 
            src="/images/modern_lab_interior.png" 
            alt="Advanced Diagnostics at Agam Diagnostics Madurai" 
            className="w-full h-full object-cover lg:object-[left_center]"
          />
        </div>
      </div>
    </section>
  );
}
