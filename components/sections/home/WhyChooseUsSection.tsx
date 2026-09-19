import React from 'react';
import { WhyChooseUsData } from '@/data/home';
import { Section, Container, Grid } from '@/components/ui';
import { FeatureCard } from '@/components/common';
import { resolveIcon } from '@/lib/iconMap';

export interface WhyChooseUsSectionProps {
  data: WhyChooseUsData[];
  eyebrow?: string;
  heading?: string;
  description?: string;
  className?: string;
}

export function WhyChooseUsSection({ 
  data, 
  eyebrow = "Why Choose AGAM",
  heading = "Uncompromising Quality & Care",
  description = "Committed to providing the highest standards in diagnostic testing.",
  className = '' 
}: WhyChooseUsSectionProps) {
  return (
    <section className={`section bg-light-gray ${className}`} id="trust">
      <div className="container">
        <div className="section-header section-header--center">
          <div className="section-header__overline">{eyebrow}</div>
          <h2 className="section-header__title">{heading}</h2>
          <p className="section-header__desc">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map((feature, idx) => (
            <FeatureCard
              key={idx}
              title={feature.title}
              description={feature.description}
              icon={resolveIcon(feature.icon)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
