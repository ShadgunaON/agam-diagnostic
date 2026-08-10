'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';

export interface AccordionSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface PremiumDetailLayoutProps {
  className?: string;
  header: {
    title: string;
    category: string;
    description: string;
    price: number | string;
    badges?: Array<{ title: string; icon?: React.ReactNode }>;
  };
  cartData: {
    id: string;
    slug: string;
    title: string;
    type: 'service' | 'package';
    category: string;
    price: number;
    originalPrice: number;
    includedTests?: string[];
  };
  sections: AccordionSection[];
  defaultOpenSection?: string;
}

export function PremiumDetailLayout({
  className = '',
  header,
  cartData,
  sections,
  defaultOpenSection
}: PremiumDetailLayoutProps) {
  const [openSection, setOpenSection] = useState<string | null>(defaultOpenSection || sections[0]?.id || null);
  const { items, addItem, updateQuantity, removeItem } = useCart();

  return (
    <div className={`detail-content ${className}`.trim()} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
      {/* Header Card (Premium Light) */}
      <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', color: 'var(--color-text)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid #bae6fd', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        {header.badges && header.badges.length > 0 && (
          <div className="value-summary" style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {header.badges.map((badge, idx) => (
              <div key={idx} className="value-summary__item" style={{ fontSize: '11px', padding: '4px 8px', background: '#fff', color: 'var(--color-primary)', border: '1px solid #bae6fd', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {badge.icon} {badge.title}
              </div>
            ))}
          </div>
        )}

        <span style={{ display: 'inline-block', background: 'var(--color-primary)', color: '#fff', borderRadius: '4px', marginBottom: '12px', fontSize: '11px', padding: '4px 8px', fontWeight: 600 }}>{header.category}</span>
        <h1 style={{ fontSize: 'var(--fs-2xl)', marginBottom: '8px', color: 'var(--color-primary)' }}>{header.title}</h1>
        <p style={{ fontSize: 'var(--fs-base)', color: 'var(--color-text-light)', margin: 0, marginBottom: '20px' }}>{header.description}</p>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #bae6fd' }}>
          <div style={{ flex: 1 }}>
             <div style={{ fontSize: '12px', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Price</div>
             <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)' }}>₹{header.price}</div>
          </div>
          
          {(() => {
            const cartItem = items.find(i => i.id === cartData.id);
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
                onClick={() => addItem(cartData)}
              >
                Add to Cart
              </button>
            );
          })()}
        </div>
      </div>

      {/* Accordion Sections */}
      {sections.map(section => (
        <div key={section.id} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          <button onClick={() => setOpenSection(openSection === section.id ? null : section.id)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>{section.title}</h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', transition: 'transform 0.2s', transform: openSection === section.id ? 'rotate(180deg)' : 'rotate(0deg)' }}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          
          {openSection === section.id && (
            <div style={{ padding: '0 24px 24px 24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
