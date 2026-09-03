'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ServiceDetailData } from '@/domains/services/model';
import { PremiumDetailLayout } from '../shared/PremiumDetailLayout';

export interface ServiceDetailContentProps {
  data: ServiceDetailData;
  className?: string;
}

export function ServiceDetailContent({ data, className = '' }: ServiceDetailContentProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const getPropIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px' }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
      case 1:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px' }}><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
      case 2:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px' }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
      case 3:
      default:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
    }
  };

  const headerProps = {
    title: data.title,
    category: data.category,
    description: data.shortDescription || data.description || '',
    price: data.price || 1999,
    badges: (data.valueProps || []).map((prop, idx) => ({
      title: prop.title,
      icon: getPropIcon(idx)
    }))
  };

  const cartData = {
    id: `srv-${data.slug}`,
    slug: data.slug,
    title: data.title,
    type: 'service' as const,
    category: data.category,
    price: parseInt(data.price || '1999', 10),
    originalPrice: Math.round(parseInt(data.price || '1999', 10) * 1.35),
  };

  const sections = [
    {
      id: 'about',
      title: 'About This Service',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div dangerouslySetInnerHTML={{ __html: data.overview || data.aboutHtml || '' }} style={{ fontSize: '14px', lineHeight: 1.6 }} />
          
          {data.whoItIsFor ? (
            <div style={{ padding: '12px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)' }}>
              <h4 style={{ marginBottom: '8px', fontSize: '13px' }}>Who is it For?</h4>
              <div dangerouslySetInnerHTML={{ __html: data.whoItIsFor }} style={{ fontSize: '13px', lineHeight: 1.6 }} />
            </div>
          ) : (data.whoShouldUse && data.whoShouldUse.length > 0) ? (
            <div style={{ padding: '12px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)' }}>
              <h4 style={{ marginBottom: '8px', fontSize: '13px' }}>Ideal For:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                {data.whoShouldUse.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {data.whatIncludes && (
            <div style={{ padding: '12px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)' }}>
              <h4 style={{ marginBottom: '8px', fontSize: '13px' }}>What it Includes</h4>
              <div dangerouslySetInnerHTML={{ __html: data.whatIncludes }} style={{ fontSize: '13px', lineHeight: 1.6 }} />
            </div>
          )}

          <div style={{ background: '#fff', border: '1px solid var(--color-border)', padding: '12px', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ width: '18px', height: '18px', flexShrink: 0, marginTop: '2px' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div>
              <h4 style={{ color: 'var(--color-text)', fontSize: '13px', marginBottom: '2px' }}>{data.preparation?.title || 'Instructions'}</h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-light)', margin: 0 }}>{data.preparationRequired || data.preparation?.description || 'No specific preparation required.'}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'process',
      title: 'Process Overview',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(data.process || []).map((step, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                {idx + 1}
              </div>
              <div>
                <h4 style={{ marginBottom: '4px', fontSize: '14px' }}>{step.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-light)', margin: 0, lineHeight: 1.5 }}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'tests',
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
    }
  ];

  return (
    <PremiumDetailLayout 
      className={className}
      header={headerProps}
      cartData={cartData}
      sections={sections}
      defaultOpenSection="about"
    />
  );
}
