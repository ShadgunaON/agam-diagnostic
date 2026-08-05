'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ServiceDetailData } from '@/domains/services/model';
import { Grid } from '@/components/ui';
import { useCart } from '@/context/CartContext';

export interface ServiceDetailContentProps {
  data: ServiceDetailData;
  className?: string;
}

export function ServiceDetailContent({ data, className = '' }: ServiceDetailContentProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openSection, setOpenSection] = useState<string | null>('about');
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const getPropIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
      case 1:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
      case 2:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
      case 3:
      default:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
    }
  };

  return (
    <div className={`detail-content ${className}`.trim()} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
      {/* Header Card (Premium Light) */}
      <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', color: 'var(--color-text)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid #bae6fd', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div className="value-summary" style={{ marginBottom: '12px' }}>
          {data.valueProps.map((prop, idx) => (
            <div key={idx} className="value-summary__item" style={{ fontSize: '11px', padding: '4px 8px', background: '#fff', color: 'var(--color-primary)', border: '1px solid #bae6fd', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {getPropIcon(idx)} {prop.title}
            </div>
          ))}
        </div>

        <span style={{ display: 'inline-block', background: 'var(--color-primary)', color: '#fff', borderRadius: '4px', marginBottom: '12px', fontSize: '11px', padding: '4px 8px', fontWeight: 600 }}>{data.category}</span>
        <h1 style={{ fontSize: 'var(--fs-2xl)', marginBottom: '8px', color: 'var(--color-primary)' }}>{data.title}</h1>
        <p style={{ fontSize: 'var(--fs-base)', color: 'var(--color-text-light)', margin: 0, marginBottom: '20px' }}>{data.shortDescription}</p>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #bae6fd' }}>
          <div style={{ flex: 1 }}>
             <div style={{ fontSize: '12px', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Price</div>
             <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{data.price || 1999}</div>
          </div>
          
          {(() => {
            const cartItem = items.find(i => i.id === `srv-${data.slug}`);
            if (cartItem) {
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#fff' }}>
                  <button
                    type="button"
                    style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer', background: 'transparent', border: 'none', fontSize: '14px' }}
                    onClick={() => {
                      if (cartItem.quantity <= 1) {
                        removeItem(cartItem.id);
                      } else {
                        updateQuantity(cartItem.id, -1);
                      }
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', width: '20px', textAlign: 'center', color: 'var(--color-primary)' }}>{cartItem.quantity}</span>
                  <button
                    type="button"
                    style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer', background: 'transparent', border: 'none', fontSize: '14px' }}
                    onClick={() => updateQuantity(cartItem.id, 1)}
                  >
                    +
                  </button>
                </div>
              );
            }
            return (
              <button 
                type="button"
                style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                onClick={() => addItem({
                  id: `srv-${data.slug}`,
                  slug: data.slug,
                  title: data.title,
                  type: 'service',
                  category: data.category,
                  price: data.price || 1999,
                  originalPrice: Math.round((data.price || 1999) * 1.35),
                })}
              >
                Add to Cart
              </button>
            );
          })()}
        </div>
      </div>

      {/* Accordion: About & Preparation */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <button onClick={() => setOpenSection(openSection === 'about' ? null : 'about')} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>About This Service</h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', transition: 'transform 0.2s', transform: openSection === 'about' ? 'rotate(180deg)' : 'rotate(0deg)' }}><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        
        {openSection === 'about' && (
          <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <div dangerouslySetInnerHTML={{ __html: data.aboutHtml }} style={{ fontSize: '14px', lineHeight: 1.6 }} />
            
            <div style={{ padding: '12px', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-sm)' }}>
              <h4 style={{ marginBottom: '8px', fontSize: '13px' }}>Ideal For:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                {data.whoShouldUse.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--color-border)', padding: '12px', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ width: '18px', height: '18px', flexShrink: 0, marginTop: '2px' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <div>
                <h4 style={{ color: 'var(--color-text)', fontSize: '13px', marginBottom: '2px' }}>{data.preparation.title}</h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-light)', margin: 0 }}>{data.preparation.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion: Process */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <button onClick={() => setOpenSection(openSection === 'process' ? null : 'process')} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Process Overview</h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', transition: 'transform 0.2s', transform: openSection === 'process' ? 'rotate(180deg)' : 'rotate(0deg)' }}><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        
        {openSection === 'process' && (
          <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.process.map((step, idx) => (
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
          </div>
        )}
      </div>

      {/* Accordion: Related Tests */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <button onClick={() => setOpenSection(openSection === 'tests' ? null : 'tests')} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Related Tests</h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', transition: 'transform 0.2s', transform: openSection === 'tests' ? 'rotate(180deg)' : 'rotate(0deg)' }}><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        
        {openSection === 'tests' && (
          <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {data.relatedTests.map((test, idx) => (
                <Link key={idx} href={`/tests/${test.slug}`} className="card fade-in is-visible" style={{ textDecoration: 'none', padding: '12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <span className="card__tag" style={{ display: 'inline-block', marginBottom: '8px' }}>{test.category}</span>
                    <h3 className="card__title" style={{ fontSize: '14px', marginBottom: '4px' }}>{test.title}</h3>
                    <p className="card__desc" style={{ fontSize: '12px', color: 'var(--color-text-light)', margin: 0 }}>{test.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Accordion: FAQs */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <button onClick={() => setOpenSection(openSection === 'faqs' ? null : 'faqs')} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Frequently Asked Questions</h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', transition: 'transform 0.2s', transform: openSection === 'faqs' ? 'rotate(180deg)' : 'rotate(0deg)' }}><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        
        {openSection === 'faqs' && (
          <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.faqs.map((faq, idx) => (
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
          </div>
        )}
      </div>
    </div>
  );
}
