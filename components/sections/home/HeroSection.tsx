'use client';

import React from 'react';
import { HeroData } from '@/data/home';

export interface HeroSectionProps {
  data: HeroData;
  className?: string;
}

/**
 * Home Hero — data-driven: pill, heading, description and features come from `data` prop.
 * If titleSpan is empty (CMS sends full heading in titlePart1), we split on the last
 * space to extract the highlighted word automatically.
 */
export function HeroSection({ data, className = '' }: HeroSectionProps) {
  const rawPart1 = data.titlePart1 || '';
  const rawSpan  = data.titleSpan  || '';

  let headingLines: string[];
  let highlightWord: string;

  if (!rawSpan && rawPart1) {
    const lastSpaceIdx = rawPart1.trimEnd().lastIndexOf(' ');
    if (lastSpaceIdx > -1) {
      headingLines = rawPart1.slice(0, lastSpaceIdx).split('\n');
      highlightWord = rawPart1.slice(lastSpaceIdx + 1).trim();
    } else {
      headingLines = rawPart1.split('\n');
      highlightWord = '';
    }
  } else {
    headingLines = rawPart1.split('\n');
    highlightWord = rawSpan;
  }

  const heroImage = (data as any).image || '/images/modern_lab_interior.png';
  const featuresData = data.features || [];

  return (
    <section className={`hero-premium section !p-0 overflow-hidden relative ${className}`.trim()} style={{ background: '#ffffff' }}>
      <div className="flex flex-col lg:grid lg:grid-cols-[55%_45%] items-stretch">
        {/* Left Column */}
        <div className="flex flex-col justify-center relative z-10 lg:py-8 lg:pl-[max(1.5rem,calc((100vw-var(--max-width))/2+1.5rem))] lg:pr-8 text-center lg:text-left">
          
          {/* Title */}
          <div className="hero-premium__content px-6 pt-12 pb-6 lg:p-0">
            <div className="hero-premium__pill">
              {data.pillText || 'NABL Accredited / Trusted Diagnostics'}
            </div>
            <h1 className="hero-premium__title">
              {headingLines.map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < headingLines.length - 1 && <br />}
                </React.Fragment>
              ))}
              {highlightWord && <> <span>{highlightWord}</span></>}
            </h1>
            <p className="hero-premium__desc mx-auto lg:mx-0">
              {data.description || "Agam Diagnostics is Madurai's most trusted NABL accredited and ICMR approved fully automated pathology laboratory."}
            </p>
          </div>

          {/* Mobile Image */}
          <div className="lg:hidden relative w-full aspect-[4/3] sm:aspect-video flex items-center justify-center overflow-hidden">
            <img
              src={heroImage}
              alt="Advanced Diagnostics at Agam Diagnostics Madurai"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Features Strip */}
          <div className="hero-premium__content px-6 pb-12 pt-8 lg:p-0 lg:mt-8">
            <div className="relative">
              <div className="hero-features flex overflow-x-auto pb-4 snap-x snap-mandatory">
                {featuresData.length > 0 ? (
                  featuresData.map((feature, i) => (
                    <div key={i} className={`hero-feature reveal reveal-delay-${i + 1} snap-start`}>
                      <div className="hero-feature__icon">{feature.icon}</div>
                      <div>
                        <span className="hero-feature__text">{feature.title}</span>
                        <span className="hero-feature__sub">{feature.subtitle}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
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
                  </>
                )}
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
            src={heroImage}
            alt="Advanced Diagnostics at Agam Diagnostics Madurai"
            className="w-full h-full object-cover lg:object-[left_center]"
          />
        </div>
      </div>
    </section>
  );
}
