import React from 'react';
import { WhyChooseUsData } from '@/data/home';
import { Typography } from '@/components/ui';
import { Section, Container, Grid } from '@/components/ui';
import { FeatureCard } from '@/components/common';

export interface WhyChooseUsSectionProps {
  data: WhyChooseUsData[];
  className?: string;
}

export function WhyChooseUsSection({ data, className = '' }: WhyChooseUsSectionProps) {
  return (
    <section className={`section bg-light-gray ${className}`} id="trust">
      <div className="container">
        <div className="section-header section-header--center">
          <div className="section-header__overline">Why Choose AGAM</div>
          <h2 className="section-header__title">Uncompromising Quality &amp; Care</h2>
          <p className="section-header__desc">Committed to providing the highest standards in diagnostic testing.</p>
        </div>

        <div className="grid grid--3">
          {data.map((feature, idx) => (
            <FeatureCard
              key={idx}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
