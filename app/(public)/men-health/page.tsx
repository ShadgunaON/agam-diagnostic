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
      <section className="hero-premium section" style={{ padding: 0, background: 'var(--color-bg-alt)', overflow: 'hidden', position: 'relative' }}>
        <div className="grid" style={{ gridTemplateColumns: '45% 55%', alignItems: 'stretch' }}>
          <div style={{ padding: 'var(--sp-2) var(--sp-6) var(--sp-10) max(var(--sp-6), calc((100vw - var(--max-width)) / 2 + var(--sp-6)))', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
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
          <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--color-bg-alt) 0%, var(--color-bg-alt) 2%, transparent 15%)', zIndex: 1 }}></div>
            <img src="/images/mens_health_hero.png" alt="Men's Health Screening" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '20% center', borderRadius: 0 }} />
          </div>
        </div>
      </section>

      <PackagesFeaturedSection id="packages-grid" data={mensPackages} title="Men's Health Packages" subtitle="Specialized diagnostic panels designed for men at every stage of life." />

      <section className="section">
        <div className="container">
          <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-6)' }}>
            <h2 className="section-header__title" style={{ fontSize: 'var(--fs-2xl)' }}>Explore Other Categories</h2>
          </div>
          <div className="grid grid--2 reveal">
            <Link href="/women-health" className="card--service" style={{ textDecoration: 'none', padding: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
              <div className="card__icon" style={{ background: '#FCE7F3', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#DB2777" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
              <div>
                <h3 className="card__title" style={{ fontSize: 'var(--fs-base)', color: 'var(--color-primary)', marginBottom: 'var(--sp-1)' }}>Women&apos;s Health Packages</h3>
                <p className="card__desc" style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>Hormonal, thyroid, PCOS, pregnancy, and bone health screening for women.</p>
              </div>
            </Link>
            <Link href="/lifestyle-health" className="card--service" style={{ textDecoration: 'none', padding: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
              <div className="card__icon" style={{ background: '#ECFCCB', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#65A30D" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div>
                <h3 className="card__title" style={{ fontSize: 'var(--fs-base)', color: 'var(--color-primary)', marginBottom: 'var(--sp-1)' }}>Lifestyle Health Packages</h3>
                <p className="card__desc" style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>Diabetes, obesity, stress, fitness, and corporate wellness checkups.</p>
              </div>
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
