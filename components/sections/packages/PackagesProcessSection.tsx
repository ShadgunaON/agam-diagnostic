import React from 'react';
import { Section, Container, Grid } from '@/components/ui';

export interface PackagesProcessSectionProps {
  data: Array<{
    title: string;
    description: string;
  }>;
  className?: string;
}

export function PackagesProcessSection({ data, className = '' }: PackagesProcessSectionProps) {
  return (
    <section className={`section section--alt ${className}`.trim()}>
      <div className="container">
        <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-8)' }}>
          <div className="section-header__overline">How It Works</div>
          <h2 className="section-header__title">4 Simple Steps to Better Health</h2>
        </div>
        
        <div className="process-flow reveal">
          {data.map((step, idx) => (
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
