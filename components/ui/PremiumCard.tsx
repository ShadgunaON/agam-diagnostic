"use client";

import React from 'react';
import Link from 'next/link';

export interface PremiumCardProps {
  title: string;
  category: string; 
  originalPrice?: number;
  price: number;
  discountLabel?: string;
  features: Array<{ text: string; subtext: string; icon?: React.ReactNode }>;
  slug: string;
  type?: 'test' | 'package' | 'service';
  onAddToCart?: () => void;
  actionButton?: React.ReactNode;
}

export function PremiumCard({
  title,
  category,
  originalPrice,
  price,
  discountLabel,
  features,
  slug,
  type = 'test',
  onAddToCart,
  actionButton
}: PremiumCardProps) {
  return (
    <div className="premium-carousel-card group hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 transition-all duration-300" style={{ 
      width: '100%', 
      borderRadius: '12px', 
      overflow: 'hidden', 
      boxShadow: '0 8px 24px -8px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff',
      border: '1px solid var(--color-border)'
    }}>
      {/* Top half: Subtle Light */}
      <div style={{ 
        background: 'var(--color-primary-light)', 
        color: 'var(--color-text)', 
        padding: '12px 16px', 
        position: 'relative' 
      }}>
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          right: '12px', 
          background: 'var(--color-primary)', 
          color: '#fff',
          padding: '2px 8px',
          borderBottomLeftRadius: '4px',
          borderBottomRightRadius: '4px',
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 700
        }}>
          {category}
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '8px', paddingRight: '40px', lineHeight: 1.3, color: 'var(--color-text)' }}>
          {title}
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            {discountLabel && (
              <div style={{ background: '#00d084', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginBottom: '2px' }}>
                {discountLabel}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            {originalPrice && (
              <div style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--color-text-light)', marginBottom: '-2px' }}>
                ₹{originalPrice}
              </div>
            )}
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              ₹{price}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom half: White */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          {features.slice(0, 2).map((feat, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
              <div style={{ opacity: 0.5, marginTop: '2px' }}>
                {feat.icon || (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                )}
              </div>
              <div style={{ fontSize: '10px', lineHeight: 1.2 }}>
                <div style={{ color: '#666', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{feat.text}</div>
                <div style={{ fontWeight: 600, color: '#333', fontSize: '11px' }}>{feat.subtext}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <Link href={`/${type === 'package' ? 'health-packages' : type === 'service' ? 'services' : 'tests'}/${slug}`} style={{ flex: 1, textDecoration: 'none', display: 'flex' }}>
            <button style={{ width: '100%', padding: '6px', fontSize: '12px', background: '#fff', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              View Details
            </button>
          </Link>
          {actionButton ? (
            actionButton
          ) : (
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (onAddToCart) onAddToCart();
              }}
              style={{ flex: 1, padding: '6px', fontSize: '12px', background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
