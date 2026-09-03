'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TestItem as TestDetailData } from '@/domains/tests/model';
import { PremiumDetailLayout } from '../shared/PremiumDetailLayout';

export interface TestDetailContentProps {
  data: TestDetailData;
  className?: string;
}

export function TestDetailContent({ data, className = '' }: TestDetailContentProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const headerProps = {
    title: data.title,
    category: data.category,
    description: data.description,
    price: data.price || 150,
    badges: [
      {
        title: data.turnaroundTime || 'Standard Turnaround',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px' }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
      },
      data.fastingRequired
        ? {
            title: 'Fasting Required',
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          }
        : {
            title: 'No Fasting',
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px' }}><polyline points="20 6 9 17 4 12" /></svg>
          }
    ]
  };

  const cartData = {
    id: `test-${data.slug}`,
    slug: data.slug,
    title: data.title,
    type: 'service' as const, // For cart purposes, a test is a service
    category: data.category,
    price: parseInt(data.price || '150', 10),
    originalPrice: Math.round(parseInt(data.price || '150', 10) * 1.35),
  };

  const sections = [];
  
  if (data.overview) {
    sections.push({
      id: 'overview',
      title: 'Overview',
      content: (
        <div dangerouslySetInnerHTML={{ __html: data.overview }} style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text)' }} />
      )
    });
  }

  sections.push(
    {
      id: 'who',
      title: 'Who Should Get This Test?',
      content: (
        <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text)' }}>
          {data.whatItChecks || data.whoShouldGet || 'This test helps provide clinical insights for your health.'}
        </p>
      )
    }
  );

  if (data.whyPerformed) {
    sections.push({
      id: 'why',
      title: 'Why is it Performed?',
      content: (
        <div dangerouslySetInnerHTML={{ __html: data.whyPerformed }} style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text)' }} />
      )
    });
  }

  sections.push(
    {
      id: 'preparation',
      title: 'Preparation Required',
      content: (
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', padding: '16px', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '2px' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div>
            <h4 style={{ color: 'var(--color-text)', fontSize: '14px', marginBottom: '4px' }}>Important Instructions</h4>
            <p style={{ fontSize: '13px', color: 'var(--color-text-light)', margin: 0, lineHeight: 1.5 }}>{data.preparationRequired || data.preparation || 'No specific preparation required.'}</p>
          </div>
        </div>
      )
    },
    {
      id: 'faqs',
      title: 'Frequently Asked Questions',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(data.faqs || []).map((faq, idx) => (
            <div key={idx} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--color-bg-alt)', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>{faq.question}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', transition: 'transform 0.2s', transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {openFaq === idx && (
                <div style={{ padding: '0 16px 16px 16px', background: 'var(--color-bg-alt)' }}>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-light)', margin: 0, lineHeight: 1.5 }}>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'related',
      title: 'Related Tests',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {(data.relatedTests || []).map((test, idx) => (
            <Link key={idx} href={`/tests/${test.slug}`} className="card fade-in is-visible" style={{ textDecoration: 'none', padding: '12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <span className="card__tag" style={{ display: 'inline-block', marginBottom: '8px' }}>{test.category}</span>
                <h3 className="card__title" style={{ fontSize: '14px', marginBottom: '4px' }}>{test.title}</h3>
                <p className="card__desc" style={{ fontSize: '12px', color: 'var(--color-text-light)', margin: 0 }}>{test.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )
    }
  );

  return (
    <PremiumDetailLayout 
      className={className}
      header={headerProps}
      cartData={cartData}
      sections={sections}
      defaultOpenSection="who"
    />
  );
}
