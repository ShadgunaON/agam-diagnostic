import React from 'react';

import { ServiceData } from '@/data/home';
import { ServiceCard } from '@/components/common/ServiceCard';
import { Button } from '@/components/ui';

export interface ServicesSectionProps {
  data: ServiceData[];
  className?: string;
}

export function ServicesSection({ data, className = '' }: ServicesSectionProps) {
  return (
    <section className={`section bg-white ${className}`} id="services">
      <div className="container">
        <div className="section-header section-header--center">
          <div className="section-header__overline">Our Services</div>
          <h2 className="section-header__title">Comprehensive Diagnostic Solutions</h2>
          <p className="section-header__desc">Advanced technology, expert pathologists, and a patient-first approach.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((service, idx) => (
            <ServiceCard
              key={idx}
              title={service.title}
              description={service.description}
              icon={service.icon}
              href={service.href}
              delay={idx + 1}
            />
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: 'var(--sp-8)' }}>
          <Button href="/services" variant="primary">
            View All Services
          </Button>
        </div>
      </div>
    </section>
  );
}
