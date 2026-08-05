import React from 'react';
import { Section, Container, Grid } from '@/components/ui';
import { FeatureCard } from '@/components/common';

export interface CoreValuesSectionProps {
  data: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  className?: string;
}

export function CoreValuesSection({ data, className = '' }: CoreValuesSectionProps) {
  const getIcon = (name: string) => {
    switch (name) {
      case 'target': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
      case 'shield-check': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>;
      case 'heart': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z"/></svg>;
      case 'zap': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
      default: return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>;
    }
  };

  return (
    <Section className={className}>
      <Container>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[2px] mb-3">Our Core Values</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">What Drives Us Every Day</h2>
        </div>
        <Grid gap="6" className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {data.map((val, idx) => (
            <FeatureCard 
              key={idx}
              title={val.title}
              description={val.description}
              icon={getIcon(val.icon)}
            />
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
