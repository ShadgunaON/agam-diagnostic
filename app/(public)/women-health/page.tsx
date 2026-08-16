import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PackagesFeaturedSection } from '@/components/sections/packages';
import { siteConfig } from '@/config/site';
import { packageService } from '@/services';

export const metadata: Metadata = {
  title: `Women's Health Packages — Preventive Care for Women | ${siteConfig.name}`,
  description: "Specialized health packages for women including hormonal profiling, thyroid screening, PCOS evaluation, pregnancy care, and comprehensive women's wellness checkups.",
};

export default async function WomenHealthPage() {
  const featuredResult = await packageService.getFeaturedPackages();
  const allFeatured = featuredResult.isSuccess ? featuredResult.value : [];
  
  const womensPackages = allFeatured.filter(pkg => 
    pkg.slug.includes('women') || 
    pkg.slug.includes('basic') || 
    pkg.slug.includes('master')
  );

  return (
    <>
      <section className="hero-premium section !p-0 overflow-hidden relative" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="flex flex-col lg:grid lg:grid-cols-[45%_55%] items-stretch lg:h-[calc(100vh-90px)] lg:max-h-[640px] lg:min-h-[480px]">
          <div className="flex flex-col justify-start relative z-10 px-6 py-10 lg:pt-12 lg:pb-10 lg:pl-[max(1.5rem,calc((100vw-var(--max-width))/2+1.5rem))] lg:pr-12">
            <div className="breadcrumb" style={{ marginBottom: 'var(--sp-3)' }}>
              <Link href="/">Home</Link><span className="breadcrumb__sep">›</span><Link href="/health-packages">Health Packages</Link><span className="breadcrumb__sep">›</span><span className="breadcrumb__current">Women&apos;s Health</span>
            </div>
            <span className="hero-premium__pill">Women&apos;s Preventive Care</span>
            <h1 className="hero-premium__title" style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.125rem)', lineHeight: 1.2, fontWeight: 800, marginBottom: 'var(--sp-3)' }}>Comprehensive Health Screening Designed for Women</h1>
            <p className="hero-premium__desc" style={{ fontSize: 'var(--fs-base)', color: 'var(--color-text)', marginBottom: 'var(--sp-5)', lineHeight: 'var(--lh-relaxed)', maxWidth: '480px' }}>From hormonal health and thyroid function to pregnancy care and bone density — our women&apos;s packages are built for every stage of a woman&apos;s life.</p>
            <div>
              <Button href="#packages-grid" className="btn btn--primary">
                View All Packages
              </Button>
            </div>
          </div>
          <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-auto lg:h-full flex items-center justify-center overflow-hidden">
            <div className="hidden lg:block absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, var(--color-bg-alt) 0%, transparent 15%)' }}></div>
            <img src="/images/womens_hero.png" alt="Women's Health Screening" className="w-full h-full object-cover object-top md:object-[20%_center] lg:object-center rounded-2xl lg:rounded-none" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: 'var(--sp-6)' }}>
            <div className="section-header__overline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/></svg>
              Recommended For
            </div>
            <h2 className="section-header__title" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)' }}>Who Should Consider Women&apos;s Health Packages?</h2>
            <p className="section-header__desc">Our women&apos;s health packages are designed for proactive care at every life stage — whether you&apos;re planning a family, managing a condition, or simply staying ahead of health risks.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 reveal" style={{ gap: 'var(--sp-4)' }}>
            <div className="feature-item" style={{ flexDirection: 'column', textAlign: 'center', padding: 'var(--sp-5)' }}>
              <div className="feature-item__icon" style={{ margin: '0 auto var(--sp-3) auto' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div className="feature-item__title" style={{ marginBottom: 'var(--sp-1)' }}>Women 20+</div>
              <div className="feature-item__desc">Annual wellness screening for early detection of hormonal imbalances, anemia, and nutritional deficiencies.</div>
            </div>
            <div className="feature-item" style={{ flexDirection: 'column', textAlign: 'center', padding: 'var(--sp-5)' }}>
              <div className="feature-item__icon" style={{ margin: '0 auto var(--sp-3) auto' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
              <div className="feature-item__title" style={{ marginBottom: 'var(--sp-1)' }}>Pregnancy Planning</div>
              <div className="feature-item__desc">Pre-conception screening to ensure optimal maternal health before and during pregnancy.</div>
            </div>
            <div className="feature-item" style={{ flexDirection: 'column', textAlign: 'center', padding: 'var(--sp-5)' }}>
              <div className="feature-item__icon" style={{ margin: '0 auto var(--sp-3) auto' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div className="feature-item__title" style={{ marginBottom: 'var(--sp-1)' }}>PCOS & Hormonal Issues</div>
              <div className="feature-item__desc">Targeted profiling for polycystic ovarian syndrome, irregular cycles, and hormonal imbalances.</div>
            </div>
            <div className="feature-item" style={{ flexDirection: 'column', textAlign: 'center', padding: 'var(--sp-5)' }}>
              <div className="feature-item__icon" style={{ margin: '0 auto var(--sp-3) auto' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="feature-item__title" style={{ marginBottom: 'var(--sp-1)' }}>Menopause & Bone Health</div>
              <div className="feature-item__desc">Bone density markers, calcium profiling, and vitamin D assessment for women 45+.</div>
            </div>
            <div className="feature-item" style={{ flexDirection: 'column', textAlign: 'center', padding: 'var(--sp-5)' }}>
              <div className="feature-item__icon" style={{ margin: '0 auto var(--sp-3) auto' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              </div>
              <div className="feature-item__title" style={{ marginBottom: 'var(--sp-1)' }}>Thyroid Disorders</div>
              <div className="feature-item__desc">Comprehensive T3, T4, TSH screening — essential for women with fatigue, weight changes, or family history.</div>
            </div>
            <div className="feature-item" style={{ flexDirection: 'column', textAlign: 'center', padding: 'var(--sp-5)' }}>
              <div className="feature-item__icon" style={{ margin: '0 auto var(--sp-3) auto' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div className="feature-item__title" style={{ marginBottom: 'var(--sp-1)' }}>Annual Wellness</div>
              <div className="feature-item__desc">Routine comprehensive checkup for women who prioritize proactive health management year after year.</div>
            </div>
          </div>
        </div>
      </section>

      <PackagesFeaturedSection id="packages-grid" data={womensPackages} title="Women's Health Packages" subtitle="Specialized diagnostic panels designed for women at every stage of life." />

      <section className="section">
        <div className="container">
          <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-6)' }}>
            <h2 className="section-header__title" style={{ fontSize: 'var(--fs-2xl)' }}>Explore Other Categories</h2>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12 reveal">
            <Link href="/men-health" className="card--service group w-full md:w-[380px]" style={{ textDecoration: 'none', padding: 'var(--sp-6)' }}>
              <div className="w-full h-48 rounded-xl overflow-hidden mb-6 relative shadow-sm group-hover:shadow-md transition-shadow">
                <img src="/images/mens_health.png" className="w-full h-full object-cover object-top  group-hover:scale-105 transition-transform duration-500" alt="Men's Health" />
              </div>
              <h3 className="card__title" style={{ color: 'var(--color-primary)', marginBottom: 'var(--sp-2)' }}>Men&apos;s Health</h3>
              <p className="card__desc" style={{ marginBottom: 'var(--sp-5)' }}>Executive health profiles, cardiac risk assessment, liver & kidney function, prostate screening, metabolic panels, and preventive checkups for men.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
                <span className="badge badge--primary" style={{ fontSize: '10px' }}>Executive Health</span>
                <span className="badge badge--primary" style={{ fontSize: '10px' }}>Heart Care</span>
                <span className="badge badge--primary" style={{ fontSize: '10px' }}>Metabolic</span>
                <span className="badge badge--primary" style={{ fontSize: '10px' }}>Liver Health</span>
              </div>
              <span className="card__link">Explore 6 Packages <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', marginLeft: '4px' }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
            </Link>

            <Link href="/lifestyle-health" className="card--service group w-full md:w-[380px]" style={{ textDecoration: 'none', padding: 'var(--sp-6)' }}>
              <div className="w-full h-48 rounded-xl overflow-hidden mb-6 relative shadow-sm group-hover:shadow-md transition-shadow">
                <img src="/images/lifestyle_health.png" className="w-full h-full object-cover object-top  group-hover:scale-105 transition-transform duration-500" alt="Lifestyle Health" />
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
            <h2 className="section-header__title">Women&apos;s Health FAQ</h2>
          </div>
          <div className="faq-accordion">
            <details className="faq-item">
              <summary className="faq-summary">When should women start getting regular health checkups?
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </summary>
              <div className="faq-content">Women should begin annual preventive health screenings from age 21. After 30, comprehensive panels including thyroid, hormonal, and bone health markers are strongly recommended. Women with a family history of diabetes, heart disease, or cancer should start earlier.</div>
            </details>
            <details className="faq-item">
              <summary className="faq-summary">What tests are included in a PCOS screening profile?
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </summary>
              <div className="faq-content">A PCOS screening typically includes LH, FSH, total testosterone, DHEA-S, insulin resistance markers (fasting insulin, HOMA-IR), lipid profile, fasting blood sugar, and HbA1c to evaluate both hormonal and metabolic imbalances associated with PCOS.</div>
            </details>
            <details className="faq-item">
              <summary className="faq-summary">Is fasting required for women&apos;s health packages?
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </summary>
              <div className="faq-content">Most packages require 10–12 hours of fasting for accurate blood sugar and lipid results. Water is permitted during the fasting period. Hormonal tests can typically be done without fasting, but your report will indicate if specific conditions apply.</div>
            </details>
            <details className="faq-item">
              <summary className="faq-summary">Can I book a home sample collection for women&apos;s health packages?
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </summary>
              <div className="faq-content">Yes. Free home sample collection is available across Madurai for all women&apos;s health packages. Our trained female phlebotomists ensure a comfortable and professional experience. Book online or call +91 89408 94079.</div>
            </details>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner cta-banner--premium">
            <h3>Take charge of your health today</h3>
            <p>Book a women's health checkup with free home collection. Accurate results from NABL-accredited diagnostics you can trust.</p>
            <Link href="/book" className="btn btn--white">Book Your Package</Link>
            <a href="tel:+918940894079" className="btn btn--white-outline">Call: +91 89408 94079</a>
          </div>
        </div>
      </section>
    </>
  );
}
