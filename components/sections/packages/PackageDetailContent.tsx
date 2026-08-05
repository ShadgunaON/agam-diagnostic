'use client';

import React from 'react';
import Link from 'next/link';
import { PackageDetailData } from '@/domains/packages/model';
import { PremiumDetailLayout } from '../shared/PremiumDetailLayout';

export interface PackageDetailContentProps {
  data: PackageDetailData;
  className?: string;
}

export function PackageDetailContent({ data, className = '' }: PackageDetailContentProps) {
  const headerProps = {
    title: data.title,
    category: data.category,
    description: data.description,
    price: data.price || 1999, // Fallback if missing
    badges: data.highlights.map(highlight => ({
      title: highlight,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px' }}><polyline points="20 6 9 17 4 12" /></svg>
    }))
  };

  const cartData = {
    id: `pkg-${data.slug}`,
    slug: data.slug,
    title: data.title,
    type: 'package' as const,
    category: data.category,
    price: parseInt(data.price || '1999', 10),
    originalPrice: Math.round(parseInt(data.price || '1999', 10) * 1.35),
  };

  const sections = [
    {
      id: 'includes',
      title: 'What\'s Included',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)' }}>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 1.8 }}>
              {data.includes.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'who',
      title: 'Who Should Get This Package?',
      content: (
        <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text)' }}>
          {data.whoShouldGet}
        </p>
      )
    },
    {
      id: 'preparation',
      title: 'Preparation Required',
      content: (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', padding: '16px', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '2px' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div>
            <h4 style={{ color: 'var(--color-text)', fontSize: '14px', marginBottom: '4px' }}>Important Instructions</h4>
            <p style={{ fontSize: '13px', color: 'var(--color-text-light)', margin: 0, lineHeight: 1.5 }}>{data.preparation}</p>
          </div>
        </div>
      )
    },
    {
      id: 'related',
      title: 'Related Packages',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {data.relatedPackages.map((pkg, idx) => (
            <Link key={idx} href={`/health-packages/${pkg.slug}`} className="card fade-in is-visible" style={{ textDecoration: 'none', padding: '12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <span className="card__tag" style={{ display: 'inline-block', marginBottom: '8px' }}>{pkg.category}</span>
                <h3 className="card__title" style={{ fontSize: '14px', marginBottom: '4px' }}>{pkg.title}</h3>
                <p className="card__desc" style={{ fontSize: '12px', color: 'var(--color-text-light)', margin: 0 }}>{pkg.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )
    }
  ];

  return (
    <PremiumDetailLayout 
      className={className}
      header={headerProps}
      cartData={cartData}
      sections={sections}
      defaultOpenSection="includes"
    />
  );
}
