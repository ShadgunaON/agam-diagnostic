import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export interface PackageDetailSidebarProps {
  highlights: string[];
  className?: string;
}

export function PackageDetailSidebar({ highlights, className = '' }: PackageDetailSidebarProps) {
  return (
    <aside className={`detail-sidebar ${className}`.trim()}>
      <div className="detail-sidebar__box" style={{ background: 'var(--color-primary-light)', borderColor: 'var(--color-primary)' }}>
        <h4 style={{ color: 'var(--color-primary)' }}>Book This Package</h4>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-light)', marginBottom: 'var(--sp-4)' }}>Schedule an appointment or book home collection.</p>
        <Button href="/book" className="btn btn--primary btn--block" style={{ marginBottom: 'var(--sp-3)' }}>
          Book Appointment
        </Button>
        <Button href="tel:+918940894079" className="btn btn--outline btn--block">
          Call: +91 89408 94079
        </Button>
      </div>

      <div className="detail-sidebar__box">
        <h4>Package Highlights</h4>
        <ul style={{ margin: 0 }}>
          {highlights.map((highlight, idx) => (
            <li 
              key={idx} 
              style={{ 
                padding: 'var(--sp-2) 0', 
                borderBottom: idx === highlights.length - 1 ? 'none' : '1px solid var(--color-border)', 
                fontSize: 'var(--fs-sm)', 
                display: 'flex', 
                gap: 'var(--sp-2)' 
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {highlight}
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-sidebar__box" style={{ background: 'var(--color-dark)', color: '#fff', border: 'none' }}>
        <h4 style={{ color: '#fff' }}>Need Help?</h4>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--sp-4)' }}>Our team can help you choose the right package.</p>
        <Button href="https://wa.me/918940894079" className="btn btn--white btn--block btn--sm" target="_blank" rel="noopener noreferrer">
          WhatsApp Us
        </Button>
      </div>
    </aside>
  );
}
