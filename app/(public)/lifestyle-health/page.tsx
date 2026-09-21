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
  title: `Lifestyle Health Packages — Diabetes, Stress & Wellness Checkups | ${siteConfig.name}`,
  description: "Lifestyle health packages for diabetes screening, obesity risk profiling, stress monitoring, vitamin deficiency panels, corporate wellness, and fitness evaluations.",
};

const DEFAULT_CONTENT: CategoryPageContent = {
  hero: {
    eyebrow: 'Lifestyle & Wellness',
    title: 'Health Packages for Modern Lifestyle Risks',
    description: 'Sedentary routines, stress, poor nutrition, and screen-heavy lifestyles create silent health risks. Our lifestyle packages detect diabetes, vitamin deficiencies, obesity markers, and metabolic imbalances early.',
    image: '/images/lifestyle_hero.png',
    imageAlt: 'Lifestyle Health Screening',
    primaryActionLabel: 'View All Packages',
    primaryActionLink: '#packages-grid',
    isVisible: true,
  },
  information: {
    overline: 'Risk Awareness',
    title: 'Who Should Consider Lifestyle Packages?',
    description: 'Modern lifestyles introduce health risks that often go undetected until they become chronic conditions. Regular screening can identify these risks early.',
    isVisible: true,
    items: [
      { title: 'Poor Sleep', description: 'Irregular sleep disrupts hormones and immunity.', icon: 'Moon', colorTheme: 'amber' },
      { title: 'Chronic Stress', description: 'Elevated cortisol leads to heart disease.', icon: 'Activity', colorTheme: 'red' },
      { title: 'Sedentary Work', description: 'Prolonged sitting increases risk of obesity.', icon: 'Monitor', colorTheme: 'blue' },
      { title: 'Poor Nutrition', description: 'Nutrient gaps lead to vitamin deficiencies.', icon: 'Apple', colorTheme: 'green' },
      { title: 'Obesity Risk', description: 'Excess weight is linked to diabetes.', icon: 'Scale', colorTheme: 'purple' },
      { title: 'Substance Use', description: 'Smoking and alcohol severely impact organs.', icon: 'Wine', colorTheme: 'teal' }
    ]
  },
  featured: {
    title: 'Lifestyle Health Packages',
    subtitle: 'Preventive checkups targeted for stress, metabolic health, and daily wellness.',
    packageIds: [],
    isVisible: true,
  },
  exploreCategories: {
    title: 'Explore Other Categories',
    isVisible: true,
    categories: [
      { id: 'women', title: 'Women\'s Health', description: 'Hormonal health, thyroid screening, PCOS profiling, bone density markers, pregnancy care, and comprehensive women\'s wellness checkups.', image: '/images/womens_health.png', link: '/women-health', badges: ['Hormonal Care', 'Pregnancy', 'Bone Health', 'Thyroid'] },
      { id: 'men', title: 'Men\'s Health', description: 'Executive health profiles, cardiac risk assessment, liver & kidney function, prostate screening, metabolic panels, and preventive checkups for men.', image: '/images/mens_health.png', link: '/men-health', badges: ['Executive Health', 'Heart Care', 'Metabolic', 'Liver Health'] }
    ]
  },
  faq: {
    overline: 'Common Questions',
    title: 'Lifestyle Health FAQ',
    isVisible: true,
    items: [
      { question: 'Who should consider a lifestyle health checkup?', answer: 'Anyone with a sedentary lifestyle, high stress, irregular diet, family history of diabetes or obesity, or those working in high-pressure corporate environments should get a lifestyle health checkup at least once a year. It\'s especially important after age 25.' },
      { question: 'What does the Diabetic Care Profile include?', answer: 'The Diabetic Care Profile includes fasting and post-prandial blood sugar, HbA1c, complete lipid profile, kidney function tests (creatinine, BUN, eGFR), urine microalbumin, and retinal risk markers for comprehensive diabetic monitoring and prevention.' },
      { question: 'Can vitamin deficiency cause fatigue and brain fog?', answer: 'Absolutely. Deficiencies in Vitamin D, B12, iron, and folate are among the leading causes of chronic fatigue, brain fog, poor concentration, and weakened immunity. A targeted vitamin panel can identify these issues and guide supplementation.' },
      { question: 'Are lifestyle packages available for corporate groups?', answer: 'Yes. We offer corporate wellness packages with on-site sample collection at your office, customizable test panels based on employee demographics, and bulk pricing. Contact us at +91 89408 94079 for a tailored corporate wellness proposal.' }
    ]
  },
  bottomCta: {
    title: 'Don\'t Wait for Symptoms to Appear',
    description: 'Book a lifestyle health checkup today with free home collection. Fast, accurate, and NABL-accredited.',
    primaryActionLabel: 'Book Your Package',
    primaryActionLink: '/book',
    secondaryActionLabel: 'Call: +91 89408 94079',
    secondaryActionLink: 'tel:+918940894079',
    isVisible: true,
  }
};

export default async function LifestyleHealthPage() {
  const pageRes = await pageService.getPageById('lifestyle-health');
  
  let content: CategoryPageContent = DEFAULT_CONTENT;
  if (pageRes?.publishedContent) {
    try {
      const parsed = JSON.parse(pageRes.publishedContent);
      content = { ...DEFAULT_CONTENT, ...parsed };
    } catch (e) {
      console.error('Failed to parse lifestyle health page content:', e);
    }
  }

  // Fetch all packages for fallback if featured is not explicitly set
  const featuredResult = await packageService.getFeaturedPackages();
  const allFeatured = featuredResult.isSuccess ? featuredResult.value : [];
  
  const fallbackPackages = allFeatured.filter(pkg => 
    pkg.slug.includes('diabetic') || 
    pkg.slug.includes('senior') || 
    pkg.slug.includes('cardiac')
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
                <Link href="/">Home</Link><span className="breadcrumb__sep">›</span><Link href="/health-packages">Health Packages</Link><span className="breadcrumb__sep">›</span><span className="breadcrumb__current">{content.hero?.eyebrow || "Lifestyle Health"}</span>
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
            <div className="section-header" style={{ marginBottom: 'var(--sp-6)', textAlign: 'center' }}>
              <div className="section-header__overline" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                {content.information?.overline}
              </div>
              <h2 className="section-header__title" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)' }}>{content.information?.title}</h2>
              <p className="section-header__desc" style={{ margin: '0 auto', maxWidth: '600px' }}>{content.information?.description}</p>
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
                  <div key={idx} className="award-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', textAlign: 'left', padding: 'var(--sp-4)' }}>
                    <div className="award-card__icon" style={{ background: bg, color: fg, flexShrink: 0, marginBottom: 0 }}>
                      <IconComponent strokeWidth="2" style={{ width: '24px', height: '24px' }} />
                    </div>
                    <div>
                      <div className="award-card__title" style={{ marginBottom: '4px' }}>{item.title}</div>
                      <div className="award-card__desc" style={{ fontSize: '12px', marginBottom: 0 }}>{item.description}</div>
                    </div>
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
