import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PackagesFeaturedSection } from '@/components/sections/packages';
import { siteConfig } from '@/config/site';
import { packagesData } from '@/data/packages';

export const metadata: Metadata = {
  title: `Men's Health Packages — Executive & Preventive Checkups | ${siteConfig.name}`,
  description: "Specialized health packages for men including cardiac risk assessment, executive health profiles, liver & kidney screening, prostate health, and metabolic panels.",
};

export default function MenHealthPage() {
  const mensPackages = packagesData.featured.filter(pkg => 
    pkg.slug.includes('men') || 
    pkg.slug.includes('executive') || 
    pkg.slug.includes('advanced') ||
    pkg.slug.includes('master')
  );

  return (
    <>
      <section className="hero-premium section !p-0 overflow-hidden relative" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="flex flex-col lg:grid lg:grid-cols-[45%_55%] items-stretch lg:h-[calc(100vh-90px)] lg:max-h-[640px] lg:min-h-[480px]">
          <div className="flex flex-col justify-start relative z-10 px-6 py-10 lg:pt-12 lg:pb-10 lg:pl-[max(1.5rem,calc((100vw-var(--max-width))/2+1.5rem))] lg:pr-12">
            <div className="breadcrumb" style={{ marginBottom: 'var(--sp-3)' }}>
              <Link href="/">Home</Link><span className="breadcrumb__sep">›</span><Link href="/health-packages">Health Packages</Link><span className="breadcrumb__sep">›</span><span className="breadcrumb__current">Men&apos;s Health</span>
            </div>
            <span className="hero-premium__pill">Men&apos;s Preventive Care</span>
            <h1 className="hero-premium__title" style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.125rem)', lineHeight: 1.2, fontWeight: 800, marginBottom: 'var(--sp-3)' }}>Preventive Health Screening Built for Men</h1>
            <p className="hero-premium__desc" style={{ fontSize: 'var(--fs-base)', color: 'var(--color-text)', marginBottom: 'var(--sp-5)', lineHeight: 'var(--lh-relaxed)', maxWidth: '480px' }}>From executive health profiles to cardiac risk assessment and metabolic screening — stay ahead of health risks with packages designed for the modern man.</p>
            <div>
              <Button href="#packages-grid" className="btn btn--primary">
                View All Packages
              </Button>
            </div>
          </div>
          <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-auto lg:h-full flex items-center justify-center overflow-hidden">
            <div className="hidden lg:block absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, var(--color-bg-alt) 0%, transparent 15%)' }}></div>
            <img src="/images/mens_hero.png" alt="Men's Health Screening" className="w-full h-full object-cover object-top md:object-[20%_center] lg:object-center rounded-2xl lg:rounded-none" />
          </div>
        </div>
      </section>

      <PackagesFeaturedSection id="packages-grid" data={mensPackages} title="Men's Health Packages" subtitle="Specialized diagnostic panels designed for men at every stage of life." />

      <section className="section">
        <div className="container">
          <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-6)' }}>
            <h2 className="section-header__title" style={{ fontSize: 'var(--fs-2xl)' }}>Explore Other Categories</h2>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12 reveal">
            <Link href="/women-health" className="card--service group w-full md:w-[380px]" style={{ textDecoration: 'none', padding: 'var(--sp-6)' }}>
              <div className="w-full h-48 rounded-xl overflow-hidden mb-6 relative shadow-sm group-hover:shadow-md transition-shadow">
                <img src="/images/womens_health.png" className="w-full h-full object-cover object-top md:object-[center_20%] group-hover:scale-105 transition-transform duration-500" alt="Women's Health" />
              </div>
              <h3 className="card__title" style={{ color: 'var(--color-primary)', marginBottom: 'var(--sp-2)' }}>Women&apos;s Health</h3>
              <p className="card__desc" style={{ marginBottom: 'var(--sp-5)' }}>Hormonal health, thyroid screening, PCOS profiling, bone density markers, pregnancy care, and comprehensive women&apos;s wellness checkups.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
                <span className="badge badge--primary" style={{ fontSize: '10px' }}>Hormonal Care</span>
                <span className="badge badge--primary" style={{ fontSize: '10px' }}>Pregnancy</span>
                <span className="badge badge--primary" style={{ fontSize: '10px' }}>Bone Health</span>
                <span className="badge badge--primary" style={{ fontSize: '10px' }}>Thyroid</span>
              </div>
              <span className="card__link">Explore 6 Packages <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', marginLeft: '4px' }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
            </Link>

            <Link href="/lifestyle-health" className="card--service group w-full md:w-[380px]" style={{ textDecoration: 'none', padding: 'var(--sp-6)' }}>
              <div className="w-full h-48 rounded-xl overflow-hidden mb-6 relative shadow-sm group-hover:shadow-md transition-shadow">
                <img src="/images/lifestyle_health.png" className="w-full h-full object-cover object-top md:object-[center_20%] group-hover:scale-105 transition-transform duration-500" alt="Lifestyle Health" />
              </div>
              <h3 className="card__title" style={{ color: 'var(--color-primary)', marginBottom: 'var(--sp-2)' }}>Lifestyle Health</h3>
              <p className="card__desc" style={{ marginBottom: 'var(--sp-5)' }}>Diabetic screening, obesity risk profiling, vitamin deficiency panels, corporate executive checkups, and fitness evaluations.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
                <span className="badge badge--primary" style={{ fontSize: '10px' }}>Diabetes</span>
                <span className="badge badge--primary" style={{ fontSize: '10px' }}>Obesity</span>
                <span className="badge badge--primary" style={{ fontSize: '10px' }}>Vitamins</span>
                <span className="badge badge--primary" style={{ fontSize: '10px' }}>Corporate</span>
              </div>
              <span className="card__link">Explore 5 Packages <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', marginLeft: '4px' }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-6)' }}>
            <div className="section-header__overline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Common Questions
            </div>
            <h2 className="section-header__title">Men&apos;s Health FAQ</h2>
          </div>
          <div className="faq-accordion">
            <details className="faq-item">
              <summary className="faq-summary">At what age should men start annual health checkups?
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </summary>
              <div className="faq-content">Men should begin routine screening at 30. After 40, annual comprehensive checkups including cardiac risk, PSA, liver function, and metabolic panels are strongly recommended. Men with family history of heart disease or diabetes should start earlier.</div>
            </details>
            <details className="faq-item">
              <summary className="faq-summary">What does a cardiac risk assessment include?
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </summary>
              <div className="faq-content">A cardiac risk assessment includes a complete lipid profile (total cholesterol, LDL, HDL, triglycerides), hs-CRP (high-sensitivity C-reactive protein), homocysteine, Troponin I, blood sugar, and HbA1c to evaluate cardiovascular health comprehensively.</div>
            </details>
            <details className="faq-item">
              <summary className="faq-summary">Are executive health packages relevant for younger men?
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </summary>
              <div className="faq-content">Absolutely. High-stress professionals in their 30s benefit significantly from executive screening which covers organ function, vitamin levels, cardiac markers, and stress-related metabolic indicators. Early detection of lifestyle-related risks is crucial at this age.</div>
            </details>
            <details className="faq-item">
              <summary className="faq-summary">How long does it take to receive reports?
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </summary>
              <div className="faq-content">Most reports are delivered digitally within 12–24 hours. Specialized tests like tumor markers, PSA, or genetic panels may take 48–72 hours. You&apos;ll receive SMS and email notifications when your reports are ready.</div>
            </details>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner cta-banner--premium">
            <h3>Prioritize Your Health Today</h3>
            <p>Book a men's health checkup with free home collection. Accurate results from NABL-accredited diagnostics you can trust.</p>
            <Link href="/book" className="btn btn--white">Book Your Package</Link>
            <a href="tel:+918940894079" className="btn btn--white-outline">Call: +91 89408 94079</a>
          </div>
        </div>
      </section>
    </>
  );
}
