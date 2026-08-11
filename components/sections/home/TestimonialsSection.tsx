import React from 'react';
import { TestimonialData } from '@/data/home';
import { Typography } from '@/components/ui';
import { Section, Container, Grid } from '@/components/ui';
import { TestimonialCard } from '@/components/common';

export interface TestimonialsSectionProps {
  data: TestimonialData[];
  className?: string;
}

export function TestimonialsSection({ data, className = '' }: TestimonialsSectionProps) {
  return (
    <section className={`section bg-white ${className}`} id="testimonials">
      <div className="container">
        <div className="section-header section-header--center">
          <div className="section-header__overline">Patient Stories</div>
          <h2 className="section-header__title">What Our Patients Say</h2>
          <p className="section-header__desc">Don&apos;t just take our word for it. Here is what people across Madurai think about our services.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map((review, idx) => (
            <TestimonialCard
              key={idx}
              quote={review.quote}
              authorName={review.name}
              authorRole={review.role}
              authorImageUrl={review.imageUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
