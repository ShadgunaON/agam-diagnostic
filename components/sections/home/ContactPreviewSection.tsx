import React from 'react';
import { ContactPreviewData } from '@/data/home';
import { Button, Container, Section } from '@/components/ui';

export interface ContactPreviewSectionProps {
  data: ContactPreviewData;
  className?: string;
}

export function ContactPreviewSection({ data, className = '' }: ContactPreviewSectionProps) {
  return (
    <section className={`section bg-light-gray ${className}`} id="location">
      <div className="container">
        <div className="section-header section-header--center">
          <div className="section-header__overline">Visit Us</div>
          <h2 className="section-header__title">Agam Diagnostics – Main Lab</h2>
        </div>
        <div className="location-card">
          <div className="location-card__map">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.267!2d78.076!3d9.925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwNTUnMzAuMCJOIDc4wrAwNCczNi4wIkU!5e0!3m2!1sen!2sin!4v1" 
              allowFullScreen 
              loading="lazy" 
              title="Agam Diagnostics Location"
            />
          </div>
          <div className="location-card__content">
            <h3 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--color-dark)', marginBottom: 'var(--sp-6)' }}>
              Main Laboratory
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-light)', marginBottom: '8px' }}>Address</div>
                <div style={{ color: 'var(--color-text)', fontSize: 'var(--fs-sm)', lineHeight: '1.5' }}>
                  {data.address.map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}<br/>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-light)', marginBottom: '8px' }}>Working Hours</div>
                <div style={{ color: 'var(--color-text)', fontSize: 'var(--fs-sm)', lineHeight: '1.5' }}>
                  {data.hours.map((line, idx) => {
                    const [day, time] = line.split(': ');
                    return (
                      <React.Fragment key={idx}>
                        <strong>{day}:</strong> {time}<br/>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: 'var(--sp-6)' }}>
              <div style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-text-light)', marginBottom: '8px' }}>Contact Us</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <a href={`tel:${data.phone.replace(/[^0-9+]/g, '')}`} style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', marginRight: '8px' }}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> 
                  {data.phone}
                </a>
                <a href={`mailto:${data.email}`} style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', marginRight: '8px' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> 
                  {data.email}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
              <a href="/book" className="btn btn--primary">
                Book Appointment
              </a>
              <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="btn btn--outline" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', marginRight: '8px' }}><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
