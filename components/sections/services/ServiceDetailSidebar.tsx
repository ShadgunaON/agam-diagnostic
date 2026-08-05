import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export interface ServiceDetailSidebarProps {
  otherServices: Array<{ title: string; slug: string }>;
  className?: string;
}

export function ServiceDetailSidebar({ otherServices, className = '' }: ServiceDetailSidebarProps) {
  return (
    <aside className={`detail-sidebar ${className}`.trim()}>
      <div className="detail-sidebar__box" style={{ background: 'var(--color-primary-light)', borderColor: 'var(--color-primary)' }}>
        <h4 style={{ color: 'var(--color-primary)' }}>Book Home Collection</h4>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-light)', marginBottom: 'var(--sp-4)' }}>
          Get your tests done from the comfort of your home. Our phlebotomists are trained for safe and hygienic sample collection.
        </p>
        <Link href="/book" className="btn btn--primary btn--block" style={{ marginBottom: 'var(--sp-3)' }}>
          Book Appointment
        </Link>
        <Link href="tel:+918940894079" className="btn btn--outline btn--block">
          Call +91 89408 94079
        </Link>
      </div>

      <div className="detail-sidebar__box">
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', color: 'var(--color-primary)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Why Choose AGAM?
        </h4>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: 'var(--fs-sm)', color: 'var(--color-text-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '16px', height: '16px', color: '#22c55e', marginTop: '4px', flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
            NABL Accredited Lab
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: 'var(--fs-sm)', color: 'var(--color-text-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '16px', height: '16px', color: '#22c55e', marginTop: '4px', flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
            Advanced Technology
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: 'var(--fs-sm)', color: 'var(--color-text-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '16px', height: '16px', color: '#22c55e', marginTop: '4px', flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
            Expert Pathologists
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: 'var(--fs-sm)', color: 'var(--color-text-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '16px', height: '16px', color: '#22c55e', marginTop: '4px', flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
            Same Day Reports
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: 'var(--fs-sm)', color: 'var(--color-text-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '16px', height: '16px', color: '#22c55e', marginTop: '4px', flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
            Free Home Collection
          </li>
        </ul>
      </div>

      <div className="detail-sidebar__box">
        <h4>Other Services</h4>
        <ul style={{ margin: 0 }}>
          {otherServices.map((service, idx) => (
            <li 
              key={idx} 
              style={{ padding: 'var(--sp-2) 0', borderBottom: idx === otherServices.length - 1 ? 'none' : '1px solid var(--color-border)' }}
            >
              <Link 
                href={`/services/${service.slug}`} 
                style={{ fontSize: 'var(--fs-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text)', textDecoration: 'none' }}
              >
                {service.title} <span style={{ color: 'var(--color-primary)' }}>→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-sidebar__box" style={{ background: 'var(--color-dark)', color: '#fff', border: 'none' }}>
        <h4 style={{ color: '#fff' }}>Need Help?</h4>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,0.7)', marginBottom: 'var(--sp-4)' }}>Our support team is available 24/7 to answer your queries.</p>
        <Link href="https://wa.me/918940894079" className="btn btn--white btn--block btn--sm" target="_blank" rel="noopener noreferrer">
          WhatsApp Us
        </Link>
      </div>
    </aside>
  );
}
