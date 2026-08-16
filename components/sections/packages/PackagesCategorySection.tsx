import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Section, Container, Grid } from '@/components/ui';
import { packagesData } from '@/data/packages';

export function PackagesCategorySection() {
  const womenCount = packagesData.featured.filter(pkg => pkg.slug.includes('women') || pkg.slug.includes('basic') || pkg.slug.includes('master')).length;
  const menCount = packagesData.featured.filter(pkg => pkg.slug.includes('men') || pkg.slug.includes('basic') || pkg.slug.includes('master') || pkg.slug.includes('cardiac') || pkg.slug.includes('executive')).length;
  const lifestyleCount = packagesData.featured.filter(pkg => pkg.slug.includes('diabetic') || pkg.slug.includes('executive') || pkg.slug.includes('master')).length;

  return (
    <section id="browse-category" className="section">
      <div className="container">
        <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-8)' }}>
          <div className="section-header__overline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            Browse by Category
          </div>
          <h2 className="section-header__title">Find the Right Package for You</h2>
          <p className="section-header__desc">Our health packages are organized into three categories based on gender-specific needs and modern lifestyle risks. Choose yours below.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal">
          
          {/* Women's Health Category */}
          <Link href="/women-health" className="card--service group" style={{ textDecoration: 'none', padding: 'var(--sp-6)' }}>
            <div className="w-full h-48 rounded-xl overflow-hidden mb-6 relative shadow-sm group-hover:shadow-md transition-shadow">
              <Image src="/images/womens_health.png" fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Women's Health" />
            </div>
            <h3 className="card__title" style={{ color: 'var(--color-primary)', marginBottom: 'var(--sp-2)' }}>Women&apos;s Health</h3>
            <p className="card__desc" style={{ marginBottom: 'var(--sp-5)' }}>Hormonal health, thyroid screening, PCOS profiling, bone density markers, pregnancy care, and comprehensive women&apos;s wellness checkups.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Hormonal Care</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Pregnancy</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Bone Health</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Thyroid</span>
            </div>
            <span className="card__link">Explore {womenCount} Packages <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
          </Link>

          {/* Men's Health Category */}
          <Link href="/men-health" className="card--service group" style={{ textDecoration: 'none', padding: 'var(--sp-6)' }}>
            <div className="w-full h-48 rounded-xl overflow-hidden mb-6 relative shadow-sm group-hover:shadow-md transition-shadow">
              <Image src="/images/mens_health.png" fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Men's Health" />
            </div>
            <h3 className="card__title" style={{ color: 'var(--color-primary)', marginBottom: 'var(--sp-2)' }}>Men&apos;s Health</h3>
            <p className="card__desc" style={{ marginBottom: 'var(--sp-5)' }}>Executive health profiles, cardiac risk assessment, liver & kidney function, prostate screening, metabolic panels, and preventive checkups for men.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Executive Health</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Heart Care</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Metabolic</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Liver Health</span>
            </div>
            <span className="card__link">Explore {menCount} Packages <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
          </Link>

          {/* Lifestyle Health Category */}
          <Link href="/lifestyle-health" className="card--service group" style={{ textDecoration: 'none', padding: 'var(--sp-6)' }}>
            <div className="w-full h-48 rounded-xl overflow-hidden mb-6 relative shadow-sm group-hover:shadow-md transition-shadow">
              <Image src="/images/lifestyle_health.png" fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" alt="Lifestyle Health" />
            </div>
            <h3 className="card__title" style={{ color: 'var(--color-primary)', marginBottom: 'var(--sp-2)' }}>Lifestyle Health</h3>
            <p className="card__desc" style={{ marginBottom: 'var(--sp-5)' }}>Diabetic screening, obesity risk profiling, vitamin deficiency panels, corporate executive checkups, smoker&apos;s risk assessment, and fitness evaluations.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Diabetes</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Stress</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Fitness</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Obesity</span>
            </div>
            <span className="card__link">Explore {lifestyleCount} Packages <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
          </Link>

        </div>
      </div>
    </section>
  );
}
