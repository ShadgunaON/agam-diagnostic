"use client";

import React, { useEffect, useState } from 'react';
import { TestimonialData } from '@/data/home';
import { TestimonialCard } from '@/components/common';
import { reviewService } from '@/services';
import { ReviewModel } from '@/domains/review/model';

export interface TestimonialsSectionProps {
  className?: string;
  eyebrow?: string;
  heading?: string;
  description?: string;
  initialReviews?: ReviewModel[];
}

export function TestimonialsSection({ 
  className = '',
  eyebrow = "Patient Stories",
  heading = "What Our Patients Say",
  description = "Don&apos;t just take our word for it. Here is what people across Madurai think about our services.",
  initialReviews = []
}: TestimonialsSectionProps) {
  const [reviews, setReviews] = useState<ReviewModel[]>(initialReviews);
  const [loading, setLoading] = useState(initialReviews.length === 0);
  
  useEffect(() => {
    if (initialReviews.length > 0) return;
    
    const fetchReviews = async () => {
      try {
        const res = await reviewService.getPublicReviews();
        if (res.isSuccess && res.value) {
          // Take top 3 most recent approved reviews
          setReviews(res.value.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch public reviews", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const hasDynamicReviews = reviews.length > 0;

  return (
    <section className={`section bg-white ${className}`} id="testimonials">
      <div className="container">
        <div className="section-header section-header--center">
          <div className="section-header__overline">{eyebrow}</div>
          <h2 className="section-header__title">{heading}</h2>
          <p className="section-header__desc" dangerouslySetInnerHTML={{ __html: description }}></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-1 md:col-span-3 text-center py-8 text-gray-500">
              Loading patient stories...
            </div>
          ) : hasDynamicReviews ? (
            reviews.map((review) => (
              <TestimonialCard
                key={review.id}
                quote={(review as any).content || review.comment || ''}
                authorName={review.displayName || 'Verified Patient'}
                authorRole={review.verified ? 'Verified Patient' : 'Patient'}
              />
            ))
          ) : (
            <div className="col-span-1 md:col-span-3 text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
              No patient stories have been published yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
