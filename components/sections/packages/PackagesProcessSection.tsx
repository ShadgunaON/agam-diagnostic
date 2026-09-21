import React from 'react';
import { Section, Container, Grid } from '@/components/ui';

export interface PackagesProcessSectionProps {
  data: {
    title?: string;
    description?: string;
    eyebrow?: string;
    steps?: Array<{
      title: string;
      description: string;
    }>;
  };
  className?: string;
}

export function PackagesProcessSection({ data, className = '' }: PackagesProcessSectionProps) {
  return (
    <section className={`section section--alt ${className}`.trim()}>
      <div className="container">
        <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-8)' }}>
          {data.eyebrow && <div className="section-header__overline">{data.eyebrow}</div>}
          {data.title && <h2 className="section-header__title">{data.title}</h2>}
          {data.description && <p className="section-header__desc">{data.description}</p>}
        </div>
        
        <div className="process-flow reveal">
          {data.steps?.map((step, idx) => (
            <div key={idx} className="process-step">
              <div className="process-step__num">
                {idx + 1}
              </div>
              <div>
                <div className="process-step__title">{step.title.replace(/^\d+\.\s*/, '')}</div>
                <div className="process-step__desc">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
