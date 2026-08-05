import React from 'react';
import Link from 'next/link';
import { Section, Container, Grid, Card } from '@/components/ui';
import { Button } from '@/components/ui/Button';

import { ServiceItem } from '@/domains/services/model';

export interface ServicesCatalogSectionProps {
  data: ServiceItem[];
  className?: string;
}

export function ServicesCatalogSection({ data, className = '' }: ServicesCatalogSectionProps) {
  const getIcon = (iconName: string) => {
    const style = { width: '24px', height: '24px' };
    switch (iconName) {
      case 'checkup':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
      case 'dna':
      case 'genetics':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
      case 'microscope':
      case 'molecular':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
      case 'rt-pcr':
      case 'pcr':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
      case 'microbiology':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
      case 'immunology':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
      default:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><circle cx="12" cy="12" r="10"/></svg>;
    }
  };

  return (
    <Section id="services-grid" className={`section ${className}`.trim()}>
      <Container>
        <Grid className="grid--3">
          {data.map((service, idx) => (
            <Link 
              key={idx} 
              href={`/services/${service.slug}`}
              className={`card--service-premium premium-card-anim accent--${service.color || 'blue'} fade-in`}
            >
              <div className="card-premium__header">
                <div className={`card-premium__badge accent--${service.color || 'blue'}`}>
                  {service.category}
                </div>
                <div className="card-premium__icon">
                  {getIcon(service.icon)}
                </div>
              </div>
              <h3 className="card-premium__title">{service.title}</h3>
              <p className="card-premium__benefit">{service.description}</p>
              <div className="card-premium__footer">
                <div className="card-premium__price">
                  <span style={{ fontSize: '11px', color: 'var(--color-text-lighter)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', lineHeight: 1, marginBottom: '4px' }}>
                    Starting From
                  </span>
                  ₹{service.price}
                </div>
                <span className="btn btn--outline btn--sm">View Details <span className="cta-arrow">→</span></span>
              </div>
            </Link>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
