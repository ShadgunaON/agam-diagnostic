"use client";

import React, { useEffect, useState } from 'react';
import { TestimonialData } from '@/data/home';
import { TestimonialCard } from '@/components/common';
import { reviewService } from '@/services';
import { ReviewModel } from '@/domains/review/model';

export interface TestimonialsSectionProps {
  data: TestimonialData[];
  className?: string;
}

export function TestimonialsSection({ data, className = '' }: TestimonialsSectionProps) {
  const [reviews, setReviews] = useState<ReviewModel[]>([]);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await reviewService.getPublicReviews();
        if (res.isSuccess && res.value.length > 0) {
          // Take top 3 most recent approved reviews
          setReviews(res.value.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch public reviews", err);
      }
    };
    fetchReviews();
  }, []);

  // Use dynamic reviews if available, otherwise fallback to hardcoded data
  const hasDynamicReviews = reviews.length > 0;

  return (
    <section className={`section bg-white ${className}`} id="testimonials">
      <div className="container">
        <div className="section-header section-header--center">
          <div className="section-header__overline">Patient Stories</div>
          <h2 className="section-header__title">What Our Patients Say</h2>
          <p className="section-header__desc">Don&apos;t just take our word for it. Here is what people across Madurai think about our services.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hasDynamicReviews ? (
            reviews.map((review) => (
              <TestimonialCard
                key={review.id}
                quote={review.comment}
                authorName={review.displayName}
                authorRole={review.verified ? 'Verified Patient' : 'Patient'}
              />
            ))
          ) : (
            data.map((review, idx) => (
              <TestimonialCard
                key={idx}
                quote={review.quote}
                authorName={review.name}
                authorRole={review.role}
                authorImageUrl={review.imageUrl}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
