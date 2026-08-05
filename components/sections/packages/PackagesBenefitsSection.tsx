import React from 'react';
import { Section, Container, Grid } from '@/components/ui';
import { FeatureCard } from '@/components/common';

export interface PackagesBenefitsSectionProps {
  data: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  className?: string;
}

export function PackagesBenefitsSection({ data, className = '' }: PackagesBenefitsSectionProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'target': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
      case 'shield': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
      case 'calendar': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
      case 'activity': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
      default: return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>;
    }
  };

  return (
    <section className={`section ${className}`.trim()}>
      <div className="container">
        <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-8)' }}>
          <div className="section-header__overline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Why It Matters
          </div>
          <h2 className="section-header__title">Preventive Care Saves Lives</h2>
          <p className="section-header__desc">Over 70% of chronic diseases are preventable with early detection. Regular health screening is the most effective step you can take toward long-term wellness.</p>
        </div>
        
        <div className="feature-grid reveal">
          {data.map((benefit, idx) => (
            <div key={idx} className="feature-item">
              <div className="feature-item__icon">
                {getIcon(benefit.icon)}
              </div>
              <div>
                <div className="feature-item__title">{benefit.title}</div>
                <div className="feature-item__desc">{benefit.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
