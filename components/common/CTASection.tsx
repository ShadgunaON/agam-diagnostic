import React from 'react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui';

export interface CTASectionProps {
  title: string;
  description: string;
  primaryActionLabel: string;
  primaryActionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  className?: string;
}

export function CTASection({ 
  title, 
  description, 
  primaryActionLabel,
  primaryActionHref = '/book',
  secondaryActionLabel,
  secondaryActionHref = 'tel:+918940894079',
  className = '' 
}: CTASectionProps) {
  const isAlt = className.includes('section--alt');

  if (isAlt) {
    return (
      <section className={`section ${className}`}>
        <div className="container">
          <div className="cta-banner cta-banner--premium">
            <h3>{title}</h3>
            <p>{description}</p>
            <a href={primaryActionHref} className="btn btn--white">{primaryActionLabel}</a>
            {secondaryActionLabel && (
              <a href={secondaryActionHref} className="btn btn--white-outline">{secondaryActionLabel}</a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Home page variant (inline styled)
  return (
    <section className={`section bg-tint-blue ${className}`} style={{ paddingBottom: 'var(--sp-20)' }}>
      <div className="container">
        <div className="cta-banner" style={{ textAlign: 'center', maxWidth: '100%', margin: '0 auto', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', borderRadius: 'var(--radius-xl)', padding: 'var(--sp-12)', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' }}></div>
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontSize: 'var(--fs-3xl)', color: '#fff', marginBottom: 'var(--sp-4)', lineHeight: 1.1 }}>{title}</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 'var(--fs-lg)', marginBottom: 'var(--sp-8)', lineHeight: 'var(--lh-relaxed)' }}>{description}</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <a href={primaryActionHref} className="btn" style={{ background: '#fff', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', padding: '16px 40px', fontWeight: 700, fontSize: 'var(--fs-md)', boxShadow: 'var(--shadow-lg)', display: 'inline-flex', transition: 'transform var(--duration) var(--ease)' }}>
                {primaryActionLabel}
              </a>
              {secondaryActionLabel && (
                <a href={secondaryActionHref} className="btn" style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 'var(--radius-full)', padding: '16px 40px', fontWeight: 700, fontSize: 'var(--fs-md)', display: 'inline-flex', transition: 'all var(--duration) var(--ease)' }}>
                  {secondaryActionLabel}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
