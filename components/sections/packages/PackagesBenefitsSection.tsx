import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Section, Container, Grid } from '@/components/ui';
import { FeatureCard } from '@/components/common';

export interface PackagesBenefitsSectionProps {
  data: {
    title?: string;
    description?: string;
    eyebrow?: string;
    items?: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  className?: string;
}

export function PackagesBenefitsSection({ data, className = '' }: PackagesBenefitsSectionProps) {
  const getIcon = (iconName: string) => {
    if (!iconName) return <LucideIcons.CheckCircle className="w-6 h-6" />;
    
    // Map legacy hardcoded names to Lucide PascalCase
    const legacyMap: Record<string, string> = {
      'award': 'Award',
      'clock': 'Clock',
      'home': 'Home',
      'phone': 'Phone',
      'target': 'Target',
      'shield': 'Shield',
      'calendar': 'Calendar',
      'activity': 'Activity'
    };
    
    const mappedName = legacyMap[iconName] || iconName;
    const toPascalCase = (str: string) => str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    
    const IconComponent = (LucideIcons as any)[toPascalCase(mappedName)] || LucideIcons.CheckCircle;
    return <IconComponent className="w-6 h-6" strokeWidth={2} />;
  };

  return (
    <section className={`section ${className}`.trim()}>
      <div className="container">
        <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-8)' }}>
          {data.eyebrow && (
            <div className="section-header__overline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              {data.eyebrow}
            </div>
          )}
          {data.title && <h2 className="section-header__title">{data.title}</h2>}
          {data.description && <p className="section-header__desc">{data.description}</p>}
        </div>
        
        <div className="feature-grid reveal">
          {data.items?.map((benefit, idx) => (
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
