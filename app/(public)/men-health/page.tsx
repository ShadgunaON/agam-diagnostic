import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PackagesFeaturedSection } from '@/components/sections/packages';
import { siteConfig } from '@/config/site';
import { packageService } from '@/services';
import { FeaturedPackage } from '@/domains/packages/model';

import { CategoryPageContent } from '@/domains/cms/models';
import { pageService } from '@/services/PageService';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Men's Health Packages — Executive & Preventive Checkups | ${siteConfig.name}`,
  description: "Specialized health packages for men including cardiac risk assessment, executive health profiles, liver & kidney screening, prostate health, and metabolic panels.",
};

const DEFAULT_CONTENT: CategoryPageContent = {
  hero: {
    eyebrow: 'Men\'s Preventive Care',
    title: 'Preventive Health Screening Built for Men',
    description: 'From executive health profiles to cardiac risk assessment and metabolic screening — stay ahead of health risks with packages designed for the modern man.',
    image: '/images/mens_hero.png',
    imageAlt: 'Men\'s Health Screening',
    primaryActionLabel: 'View All Packages',
    primaryActionLink: '#packages-grid',
    isVisible: true,
  },
  featured: {
    title: 'Men\'s Health Packages',
    subtitle: 'Specialized diagnostic panels designed for men at every stage of life.',
    packageIds: [],
    isVisible: true,
  },
  exploreCategories: {
    title: 'Explore Other Categories',
    isVisible: true,
    categories: [
      { id: 'women', title: 'Women\'s Health', description: 'Hormonal health, thyroid screening, PCOS profiling, bone density markers, pregnancy care, and comprehensive women\'s wellness checkups.', image: '/images/womens_health.png', link: '/women-health', badges: ['Hormonal Care', 'Pregnancy', 'Bone Health', 'Thyroid'] },
      { id: 'lifestyle', title: 'Lifestyle Health', description: 'Diabetic screening, obesity risk profiling, vitamin deficiency panels, corporate executive checkups, and fitness evaluations.', image: '/images/lifestyle_health.png', link: '/lifestyle-health', badges: ['Diabetes', 'Obesity', 'Vitamins', 'Corporate'] }
    ]
  },
  faq: {
    overline: 'Common Questions',
    title: 'Men\'s Health FAQ',
    isVisible: true,
    items: [
      { question: 'At what age should men start annual health checkups?', answer: 'Men should begin routine screening at 30. After 40, annual comprehensive checkups including cardiac risk, PSA, liver function, and metabolic panels are strongly recommended. Men with family history of heart disease or diabetes should start earlier.' },
      { question: 'What does a cardiac risk assessment include?', answer: 'A cardiac risk assessment includes a complete lipid profile (total cholesterol, LDL, HDL, triglycerides), hs-CRP (high-sensitivity C-reactive protein), homocysteine, Troponin I, blood sugar, and HbA1c to evaluate cardiovascular health comprehensively.' },
      { question: 'Are executive health packages relevant for younger men?', answer: 'Absolutely. High-stress professionals in their 30s benefit significantly from executive screening which covers organ function, vitamin levels, cardiac markers, and stress-related metabolic indicators. Early detection of lifestyle-related risks is crucial at this age.' },
      { question: 'How long does it take to receive reports?', answer: 'Most reports are delivered digitally within 12–24 hours. Specialized tests like tumor markers, PSA, or genetic panels may take 48–72 hours. You\'ll receive SMS and email notifications when your reports are ready.' }
    ]
  },
  bottomCta: {
    title: 'Prioritize Your Health Today',
    description: 'Book a men\'s health checkup with free home collection. Accurate results from NABL-accredited diagnostics you can trust.',
    primaryActionLabel: 'Book Your Package',
    primaryActionLink: '/book',
    secondaryActionLabel: 'Call: +91 89408 94079',
    secondaryActionLink: 'tel:+918940894079',
    isVisible: true,
  }
};

export default async function MenHealthPage() {
  const pageRes = await pageService.getPageById('men-health');
  
  let content: CategoryPageContent = DEFAULT_CONTENT;
  if (pageRes?.publishedContent) {
    try {
      const parsed = JSON.parse(pageRes.publishedContent);
      content = { ...DEFAULT_CONTENT, ...parsed };
    } catch (e) {
      console.error('Failed to parse men health page content:', e);
    }
  }

  const featuredResult = await packageService.getFeaturedPackages();
  const allFeatured = featuredResult.isSuccess ? featuredResult.value : [];

  const fallbackPackages = allFeatured.filter(pkg =>
    pkg.category?.toLowerCase().includes("men") ||
    (pkg.slug || '').includes('men') || 
    (pkg.slug || '').includes('executive') || 
    (pkg.slug || '').includes('advanced') ||
    (pkg.slug || '').includes('master')
  );

  let displayPackages = fallbackPackages;
  if (content.featured?.packageIds && content.featured.packageIds.length > 0) {
    const customRes = await packageService.getPackagesByIds(content.featured.packageIds);
    if (customRes.isSuccess && customRes.value.length > 0) {
      displayPackages = customRes.value.map(pkg => ({
        id: pkg.id,
        slug: pkg.slug,
        title: pkg.title,
        category: pkg.category || 'Health Package',
        price: String(pkg.price ?? pkg.packagePrice ?? 0),
        individualValue: pkg.individualValue ?? 0,
        description: pkg.description || '',
        badgeText: pkg.category || 'Health Package',
        badgeColor: 'blue',
        benefit: '',
        highlightIcon: 'CheckCircle',
        highlightText: '',
        status: pkg.status,
      })) as FeaturedPackage[];
    }
  }

  return (
    <>
      {content.hero?.isVisible !== false && (
        <section className="hero-premium section !p-0 overflow-hidden relative" style={{ background: 'var(--color-bg-alt)' }}>
          <div className="flex flex-col lg:grid lg:grid-cols-[45%_55%] items-stretch lg:h-[calc(100vh-90px)] lg:max-h-[640px] lg:min-h-[480px]">
            <div className="flex flex-col justify-start relative z-10 px-6 py-10 lg:pt-12 lg:pb-10 lg:pl-[max(1.5rem,calc((100vw-var(--max-width))/2+1.5rem))] lg:pr-12">
              <div className="breadcrumb" style={{ marginBottom: 'var(--sp-3)' }}>
                <Link href="/">Home</Link><span className="breadcrumb__sep">›</span><Link href="/health-packages">Health Packages</Link><span className="breadcrumb__sep">›</span><span className="breadcrumb__current">{content.hero?.eyebrow || "Men's Health"}</span>
              </div>
              <span className="hero-premium__pill">{content.hero?.eyebrow}</span>
              <h1 className="hero-premium__title" style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.125rem)', lineHeight: 1.2, fontWeight: 800, marginBottom: 'var(--sp-3)' }}>{content.hero?.title}</h1>
              <p className="hero-premium__desc" style={{ fontSize: 'var(--fs-base)', color: 'var(--color-text)', marginBottom: 'var(--sp-5)', lineHeight: 'var(--lh-relaxed)', maxWidth: '480px' }}>{content.hero?.description}</p>
              <div>
                <Button href={content.hero?.primaryActionLink || '#'} className="btn btn--primary">
                  {content.hero?.primaryActionLabel}
                </Button>
              </div>
            </div>
            <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-auto lg:h-full flex items-center justify-center overflow-hidden">
              <div className="hidden lg:block absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, var(--color-bg-alt) 0%, transparent 15%)' }}></div>
              <img src={content.hero?.image} alt={content.hero?.imageAlt || content.hero?.title} className="w-full h-full object-cover object-top md:object-[20%_center] lg:object-center rounded-2xl lg:rounded-none" />
            </div>
          </div>
        </section>
      )}

      {content.featured?.isVisible !== false && (
        <PackagesFeaturedSection id="packages-grid" data={displayPackages} title={content.featured?.title || "Packages"} subtitle={content.featured?.subtitle || ""} />
      )}

      {content.exploreCategories?.isVisible !== false && (
        <section className="section">
          <div className="container">
            <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-6)' }}>
              <h2 className="section-header__title" style={{ fontSize: 'var(--fs-2xl)' }}>{content.exploreCategories?.title}</h2>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12 reveal">
              {content.exploreCategories?.categories?.map((cat, idx) => (
                <Link key={idx} href={cat.link || '#'} className="card--service group w-full md:w-[380px]" style={{ textDecoration: 'none', padding: 'var(--sp-6)' }}>
                  <div className="w-full h-48 rounded-xl overflow-hidden mb-6 relative shadow-sm group-hover:shadow-md transition-shadow">
                    <img src={cat.image} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" alt={cat.title} />
                  </div>
                  <h3 className="card__title" style={{ color: 'var(--color-primary)', marginBottom: 'var(--sp-2)' }}>{cat.title}</h3>
                  <p className="card__desc" style={{ marginBottom: 'var(--sp-5)' }}>{cat.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
                    {cat.badges?.map((badge, bidx) => (
                      <span key={bidx} className="badge badge--primary" style={{ fontSize: '10px' }}>{badge}</span>
                    ))}
                  </div>
                  <span className="card__link">Explore Packages <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', display: 'inline', marginLeft: '4px' }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {content.faq?.isVisible !== false && (
        <section className="section section--alt">
          <div className="container" style={{ maxWidth: '800px' }}>
            <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-6)' }}>
              <div className="section-header__overline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                {content.faq?.overline}
              </div>
              <h2 className="section-header__title">{content.faq?.title}</h2>
            </div>
            <div className="faq-accordion">
              {content.faq?.items?.map((item, idx) => (
                <details key={idx} className="faq-item">
                  <summary className="faq-summary">{item.question}
                    <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </summary>
                  <div className="faq-content">{item.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {content.bottomCta?.isVisible !== false && (
        <section className="section">
          <div className="container">
            <div className="cta-banner cta-banner--premium">
              <h3>{content.bottomCta?.title}</h3>
              <p>{content.bottomCta?.description}</p>
              <Link href={content.bottomCta?.primaryActionLink || '#'} className="btn btn--white">{content.bottomCta?.primaryActionLabel}</Link>
              <a href={content.bottomCta?.secondaryActionLink || '#'} className="btn btn--white-outline">{content.bottomCta?.secondaryActionLabel}</a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
