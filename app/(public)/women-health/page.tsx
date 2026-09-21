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
import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Women's Health Packages — Preventive Care for Women | ${siteConfig.name}`,
  description: "Specialized health packages for women including hormonal profiling, thyroid screening, PCOS evaluation, pregnancy care, and comprehensive women's wellness checkups.",
};

const DEFAULT_CONTENT: CategoryPageContent = {
  hero: {
    eyebrow: 'Women\'s Preventive Care',
    title: 'Comprehensive Health Screening Designed for Women',
    description: 'From hormonal health and thyroid function to pregnancy care and bone density — our women\'s packages are built for every stage of a woman\'s life.',
    image: '/images/womens_hero.png',
    imageAlt: 'Women\'s Health Screening',
    primaryActionLabel: 'View All Packages',
    primaryActionLink: '#packages-grid',
    isVisible: true,
  },
  information: {
    overline: 'Recommended For',
    title: 'Who Should Consider Women\'s Health Packages?',
    description: 'Our women\'s health packages are designed for proactive care at every life stage — whether you\'re planning a family, managing a condition, or simply staying ahead of health risks.',
    isVisible: true,
    items: [
      { title: 'Women 20+', description: 'Annual wellness screening for early detection of hormonal imbalances, anemia, and nutritional deficiencies.', icon: 'activity', colorTheme: 'blue' },
      { title: 'Pregnancy Planning', description: 'Pre-conception screening to ensure optimal maternal health before and during pregnancy.', icon: 'activity', colorTheme: 'blue' },
      { title: 'PCOS & Hormonal Issues', description: 'Targeted profiling for polycystic ovarian syndrome, irregular cycles, and hormonal imbalances.', icon: 'activity', colorTheme: 'blue' },
      { title: 'Menopause & Bone Health', description: 'Bone density markers, calcium profiling, and vitamin D assessment for women 45+.', icon: 'activity', colorTheme: 'blue' },
      { title: 'Thyroid Disorders', description: 'Comprehensive T3, T4, TSH screening — essential for women with fatigue, weight changes, or family history.', icon: 'activity', colorTheme: 'blue' },
      { title: 'Annual Wellness', description: 'Routine comprehensive checkup for women who prioritize proactive health management year after year.', icon: 'activity', colorTheme: 'blue' }
    ]
  },
  featured: {
    title: 'Women\'s Health Packages',
    subtitle: 'Specialized diagnostic panels designed for women at every stage of life.',
    packageIds: [],
    isVisible: true,
  },
  exploreCategories: {
    title: 'Explore Other Categories',
    isVisible: true,
    categories: [
      { id: 'men', title: 'Men\'s Health', description: 'Executive health profiles, cardiac risk assessment, liver & kidney function, prostate screening, metabolic panels, and preventive checkups for men.', image: '/images/mens_health.png', link: '/men-health', badges: ['Executive Health', 'Heart Care', 'Metabolic', 'Liver Health'] },
      { id: 'lifestyle', title: 'Lifestyle Health', description: 'Diabetic screening, obesity risk profiling, vitamin deficiency panels, corporate executive checkups, and fitness evaluations.', image: '/images/lifestyle_health.png', link: '/lifestyle-health', badges: ['Diabetes', 'Obesity', 'Vitamins', 'Corporate'] }
    ]
  },
  faq: {
    overline: 'Common Questions',
    title: 'Women\'s Health FAQ',
    isVisible: true,
    items: [
      { question: 'When should women start getting regular health checkups?', answer: 'Women should begin annual preventive health screenings from age 21. After 30, comprehensive panels including thyroid, hormonal, and bone health markers are strongly recommended. Women with a family history of diabetes, heart disease, or cancer should start earlier.' },
      { question: 'What tests are included in a PCOS screening profile?', answer: 'A PCOS screening typically includes LH, FSH, total testosterone, DHEA-S, insulin resistance markers (fasting insulin, HOMA-IR), lipid profile, fasting blood sugar, and HbA1c to evaluate both hormonal and metabolic imbalances associated with PCOS.' },
      { question: 'Is fasting required for women\'s health packages?', answer: 'Most packages require 10–12 hours of fasting for accurate blood sugar and lipid results. Water is permitted during the fasting period. Hormonal tests can typically be done without fasting, but your report will indicate if specific conditions apply.' },
      { question: 'Can I book a home sample collection for women\'s health packages?', answer: 'Yes. Free home sample collection is available across Madurai for all women\'s health packages. Our trained female phlebotomists ensure a comfortable and professional experience. Book online or call +91 89408 94079.' }
    ]
  },
  bottomCta: {
    title: 'Take charge of your health today',
    description: 'Book a women\'s health checkup with free home collection. Accurate results from NABL-accredited diagnostics you can trust.',
    primaryActionLabel: 'Book Your Package',
    primaryActionLink: '/book',
    secondaryActionLabel: 'Call: +91 89408 94079',
    secondaryActionLink: 'tel:+918940894079',
    isVisible: true,
  }
};

export default async function WomenHealthPage() {
  const pageRes = await pageService.getPageById('women-health');
  
  let content: CategoryPageContent = DEFAULT_CONTENT;
  if (pageRes?.publishedContent) {
    try {
      const parsed = JSON.parse(pageRes.publishedContent);
      content = { ...DEFAULT_CONTENT, ...parsed };
    } catch (e) {
      console.error('Failed to parse women health page content:', e);
    }
  }

  const featuredResult = await packageService.getFeaturedPackages();
  const allFeatured = featuredResult.isSuccess ? featuredResult.value : [];
  
  const fallbackPackages = allFeatured.filter(pkg =>
    pkg.category?.toLowerCase().includes("women") ||
    (pkg.slug || '').includes('women') ||
    (pkg.slug || '').includes('basic') ||
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
                <Link href="/">Home</Link><span className="breadcrumb__sep">›</span><Link href="/health-packages">Health Packages</Link><span className="breadcrumb__sep">›</span><span className="breadcrumb__current">{content.hero?.eyebrow || "Women's Health"}</span>
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

      {content.information?.isVisible !== false && (
        <section className="section">
          <div className="container">
            <div className="section-header" style={{ marginBottom: 'var(--sp-6)' }}>
              <div className="section-header__overline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/></svg>
                {content.information?.overline}
              </div>
              <h2 className="section-header__title" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)' }}>{content.information?.title}</h2>
              <p className="section-header__desc">{content.information?.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 reveal" style={{ gap: 'var(--sp-4)' }}>
              {content.information?.items?.map((item, idx) => {
                let bg = '#DBEAFE', fg = '#2563EB'; // blue
                if (item.colorTheme === 'amber') { bg = '#FEF3C7'; fg = '#D97706'; }
                if (item.colorTheme === 'red') { bg = '#FEE2E2'; fg = '#DC2626'; }
                if (item.colorTheme === 'green') { bg = '#ECFCCB'; fg = '#65A30D'; }
                if (item.colorTheme === 'purple') { bg = '#F3E8FF'; fg = '#7C3AED'; }
                if (item.colorTheme === 'teal') { bg = '#CCFBF1'; fg = '#0D9488'; }
                
                // Capitalize first letter of icon for Lucide
                const iconName = item.icon ? (item.icon.charAt(0).toUpperCase() + item.icon.slice(1)) : 'Activity';
                // @ts-ignore
                const IconComponent = LucideIcons[iconName] as LucideIcon || LucideIcons.Activity;

                return (
                  <div key={idx} className="feature-item" style={{ flexDirection: 'column', textAlign: 'center', padding: 'var(--sp-5)' }}>
                    <div className="feature-item__icon" style={{ margin: '0 auto var(--sp-3) auto', background: bg, color: fg }}>
                      <IconComponent strokeWidth="2" style={{ width: '24px', height: '24px' }} />
                    </div>
                    <div className="feature-item__title" style={{ marginBottom: 'var(--sp-1)' }}>{item.title}</div>
                    <div className="feature-item__desc">{item.description}</div>
                  </div>
                );
              })}
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
