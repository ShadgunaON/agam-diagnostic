import React from 'react';
import { ContactForm } from '@/components/forms';

export interface ContactContentSectionProps {
  data: {
    infoCards: Array<{
      title: string;
      details: string[];
      icon: string;
      variant: string;
    }>;
    location: {
      name: string;
      address: string;
      mapUrl: string;
    };
  };
  className?: string;
}

export function ContactContentSection({ data, className = '' }: ContactContentSectionProps) {
  const getIcon = (name: string) => {
    switch (name) {
      case 'clock': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
      case 'home': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
      case 'parking': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
      case 'phone': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
      default: return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>;
    }
  };

  return (
    <section className={`section ${className}`.trim()}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--sp-10)' }}>
          
          <div>
            <h2 style={{ marginBottom: 'var(--sp-6)' }}>Send us a message</h2>
            <div style={{ background: '#fff', border: '1px solid var(--color-border)', padding: 'var(--sp-8)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
              <ContactForm />
            </div>
          </div>

          <div>
            <h2 style={{ marginBottom: 'var(--sp-6)' }}>Visit Our Laboratory</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ marginBottom: 'var(--sp-6)', gap: 'var(--sp-4)' }}>
              {data.infoCards.map((card, idx: number) => (
                <div 
                  key={idx} 
                  style={{ 
                    background: card.variant === 'dark' ? 'var(--color-primary)' : '#fff', 
                    border: `1px solid ${card.variant === 'dark' ? 'var(--color-primary-dark)' : 'var(--color-border)'}`, 
                    padding: 'var(--sp-5)', 
                    borderRadius: 'var(--radius-lg)', 
                    color: card.variant === 'dark' ? '#fff' : 'inherit',
                    boxShadow: card.variant === 'dark' ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)', color: card.variant === 'dark' ? 'inherit' : 'var(--color-primary)', fontWeight: 'var(--fw-bold)' }}>
                    <div style={{ width: '18px', height: '18px', flexShrink: 0 }}>
                      {getIcon(card.icon)}
                    </div>
                    {card.title}
                  </div>
                  <div style={{ fontSize: 'var(--fs-sm)', color: card.variant === 'dark' ? 'inherit' : 'var(--color-text)', opacity: card.variant === 'dark' ? 0.95 : 1, lineHeight: 1.6 }}>
                    {card.details.map((line: string, i: number) => (
                      <div key={i} style={i === 0 ? { marginBottom: '4px', ...(card.variant === 'dark' ? { fontSize: 'var(--fs-lg)', fontWeight: 'var(--fw-bold)' } : {}) } : {}}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="location-card" style={{ marginBottom: 'var(--sp-5)' }}>
              <div className="location-card__name">{data.location.name}</div>
              <div className="location-card__info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{data.location.address}</span>
              </div>
            </div>

            <div style={{ height: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
              <iframe 
                src={data.location.mapUrl}
                allowFullScreen 
                loading="lazy" 
                title="Lab Location"
                style={{ width: '100%', height: '100%', border: 0 }}
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
