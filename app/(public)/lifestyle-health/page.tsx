import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PackagesFeaturedSection } from '@/components/sections/packages';
import { siteConfig } from '@/config/site';
import { packagesData } from '@/data/packages';

export const metadata: Metadata = {
  title: `Lifestyle Health Packages — Diabetes, Stress & Wellness Checkups | ${siteConfig.name}`,
  description: "Lifestyle health packages for diabetes screening, obesity risk profiling, stress monitoring, vitamin deficiency panels, corporate wellness, and fitness evaluations.",
};

export default function LifestyleHealthPage() {
  const lifestylePackages = packagesData.featured.filter(pkg => 
    pkg.slug.includes('diabetic') || 
    pkg.slug.includes('senior') || 
    pkg.slug.includes('cardiac')
  );

  return (
    <>
      <section className="hero-premium section !p-0 overflow-hidden relative" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="flex flex-col lg:grid lg:grid-cols-[45%_55%] items-stretch lg:h-[calc(100vh-90px)] lg:max-h-[640px] lg:min-h-[480px]">
          <div className="flex flex-col justify-start relative z-10 px-6 py-10 lg:pt-12 lg:pb-10 lg:pl-[max(1.5rem,calc((100vw-var(--max-width))/2+1.5rem))] lg:pr-12">
            <div className="breadcrumb" style={{ marginBottom: 'var(--sp-3)' }}>
              <Link href="/">Home</Link><span className="breadcrumb__sep">›</span><Link href="/health-packages">Health Packages</Link><span className="breadcrumb__sep">›</span><span className="breadcrumb__current">Lifestyle Health</span>
            </div>
            <span className="hero-premium__pill">Lifestyle & Wellness</span>
            <h1 className="hero-premium__title" style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.125rem)', lineHeight: 1.2, fontWeight: 800, marginBottom: 'var(--sp-3)' }}>Health Packages for Modern Lifestyle Risks</h1>
            <p className="hero-premium__desc" style={{ fontSize: 'var(--fs-base)', color: 'var(--color-text)', marginBottom: 'var(--sp-5)', lineHeight: 'var(--lh-relaxed)', maxWidth: '480px' }}>Sedentary routines, stress, poor nutrition, and screen-heavy lifestyles create silent health risks. Our lifestyle packages detect diabetes, vitamin deficiencies, obesity markers, and metabolic imbalances early.</p>
            <div>
              <Button href="#packages-grid" className="btn btn--primary">
                View All Packages
              </Button>
            </div>
          </div>
          <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-auto lg:h-full flex items-center justify-center overflow-hidden">
            <div className="hidden lg:block absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, var(--color-bg-alt) 0%, transparent 15%)' }}></div>
            <img src="/images/lifestyle_hero.png" alt="Lifestyle Health Screening" className="w-full h-full object-cover object-top md:object-[20%_center] lg:object-center rounded-2xl lg:rounded-none" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: 'var(--sp-6)', textAlign: 'center' }}>
            <div className="section-header__overline" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Risk Awareness
            </div>
            <h2 className="section-header__title" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)' }}>Who Should Consider Lifestyle Packages?</h2>
            <p className="section-header__desc" style={{ margin: '0 auto', maxWidth: '600px' }}>Modern lifestyles introduce health risks that often go undetected until they become chronic conditions. Regular screening can identify these risks early.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 reveal" style={{ gap: 'var(--sp-4)' }}>
            <div className="award-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', textAlign: 'left', padding: 'var(--sp-4)' }}>
              <div className="award-card__icon" style={{ background: '#FEF3C7', flexShrink: 0, marginBottom: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/></svg>
              </div>
              <div>
                <div className="award-card__title" style={{ marginBottom: '4px' }}>Poor Sleep</div>
                <div className="award-card__desc" style={{ fontSize: '12px', marginBottom: 0 }}>Irregular sleep disrupts hormones and immunity.</div>
              </div>
            </div>
            <div className="award-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', textAlign: 'left', padding: 'var(--sp-4)' }}>
              <div className="award-card__icon" style={{ background: '#FEE2E2', flexShrink: 0, marginBottom: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div>
                <div className="award-card__title" style={{ marginBottom: '4px' }}>Chronic Stress</div>
                <div className="award-card__desc" style={{ fontSize: '12px', marginBottom: 0 }}>Elevated cortisol leads to heart disease.</div>
              </div>
            </div>
            <div className="award-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', textAlign: 'left', padding: 'var(--sp-4)' }}>
              <div className="award-card__icon" style={{ background: '#DBEAFE', flexShrink: 0, marginBottom: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              </div>
              <div>
                <div className="award-card__title" style={{ marginBottom: '4px' }}>Sedentary Work</div>
                <div className="award-card__desc" style={{ fontSize: '12px', marginBottom: 0 }}>Prolonged sitting increases risk of obesity.</div>
              </div>
            </div>
            <div className="award-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', textAlign: 'left', padding: 'var(--sp-4)' }}>
              <div className="award-card__icon" style={{ background: '#ECFCCB', flexShrink: 0, marginBottom: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#65A30D" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
              </div>
              <div>
                <div className="award-card__title" style={{ marginBottom: '4px' }}>Poor Nutrition</div>
                <div className="award-card__desc" style={{ fontSize: '12px', marginBottom: 0 }}>Nutrient gaps lead to vitamin deficiencies.</div>
              </div>
            </div>
            <div className="award-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', textAlign: 'left', padding: 'var(--sp-4)' }}>
              <div className="award-card__icon" style={{ background: '#F3E8FF', flexShrink: 0, marginBottom: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <div className="award-card__title" style={{ marginBottom: '4px' }}>Obesity Risk</div>
                <div className="award-card__desc" style={{ fontSize: '12px', marginBottom: 0 }}>Excess weight is linked to diabetes.</div>
              </div>
            </div>
            <div className="award-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', textAlign: 'left', padding: 'var(--sp-4)' }}>
              <div className="award-card__icon" style={{ background: '#CCFBF1', flexShrink: 0, marginBottom: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <div className="award-card__title" style={{ marginBottom: '4px' }}>Substance Use</div>
                <div className="award-card__desc" style={{ fontSize: '12px', marginBottom: 0 }}>Smoking and alcohol severely impact organs.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PackagesFeaturedSection id="packages-grid" data={lifestylePackages} title="Lifestyle Health Packages" subtitle="Preventive checkups targeted for stress, metabolic health, and daily wellness." />

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

            <Link href="/men-health" className="card--service group w-full md:w-[380px]" style={{ textDecoration: 'none', padding: 'var(--sp-6)' }}>
              <div className="w-full h-48 rounded-xl overflow-hidden mb-6 relative shadow-sm group-hover:shadow-md transition-shadow">
                <img src="/images/mens_health.png" className="w-full h-full object-cover object-top md:object-[center_20%] group-hover:scale-105 transition-transform duration-500" alt="Men's Health" />
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
            <h2 className="section-header__title">Lifestyle Health FAQ</h2>
          </div>
          <div className="faq-accordion">
            <details className="faq-item">
              <summary className="faq-summary">Who should consider a lifestyle health checkup?
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </summary>
              <div className="faq-content">Anyone with a sedentary lifestyle, high stress, irregular diet, family history of diabetes or obesity, or those working in high-pressure corporate environments should get a lifestyle health checkup at least once a year. It&apos;s especially important after age 25.</div>
            </details>
            <details className="faq-item">
              <summary className="faq-summary">What does the Diabetic Care Profile include?
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </summary>
              <div className="faq-content">The Diabetic Care Profile includes fasting and post-prandial blood sugar, HbA1c, complete lipid profile, kidney function tests (creatinine, BUN, eGFR), urine microalbumin, and retinal risk markers for comprehensive diabetic monitoring and prevention.</div>
            </details>
            <details className="faq-item">
              <summary className="faq-summary">Can vitamin deficiency cause fatigue and brain fog?
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </summary>
              <div className="faq-content">Absolutely. Deficiencies in Vitamin D, B12, iron, and folate are among the leading causes of chronic fatigue, brain fog, poor concentration, and weakened immunity. A targeted vitamin panel can identify these issues and guide supplementation.</div>
            </details>
            <details className="faq-item">
              <summary className="faq-summary">Are lifestyle packages available for corporate groups?
                <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </summary>
              <div className="faq-content">Yes. We offer corporate wellness packages with on-site sample collection at your office, customizable test panels based on employee demographics, and bulk pricing. Contact us at +91 89408 94079 for a tailored corporate wellness proposal.</div>
            </details>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner cta-banner--premium">
            <h3>Don't Wait for Symptoms to Appear</h3>
            <p>Book a lifestyle health checkup today with free home collection. Fast, accurate, and NABL-accredited.</p>
            <Link href="/book" className="btn btn--white">Book Your Package</Link>
            <a href="tel:+918940894079" className="btn btn--white-outline">Call: +91 89408 94079</a>
          </div>
        </div>
      </section>
    </>
  );
}
