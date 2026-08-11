import React from 'react';
import { Section, Container, Grid } from '@/components/ui';
import { ServiceCard } from '@/components/common/ServiceCard';

export interface DifferenceFeature {
  title: string;
  description: string;
  variant?: 'blue' | 'purple' | 'green' | string;
}

export interface AgamDifferenceSectionProps {
  data: DifferenceFeature[];
  className?: string;
}

export function AgamDifferenceSection({ data, className = '' }: AgamDifferenceSectionProps) {
  const getIcon = (variant?: string) => {
    if (variant === 'purple') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      );
    }
    if (variant === 'green') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    );
  };

  return (
    <section className={`section ${className}`}>
      <div className="container">
        <div className="section-header section-header--center">
          <div className="section-header__overline">The AGAM Difference</div>
          <h2 className="section-header__title">Why Patients Trust AGAM</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item, idx) => (
            <ServiceCard
              key={idx}
              title={item.title}
              description={item.description}
              icon={getIcon(item.variant)}
              href="#"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
