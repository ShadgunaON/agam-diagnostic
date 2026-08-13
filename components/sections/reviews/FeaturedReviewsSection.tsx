import React from 'react';
import { TestimonialCard } from '@/components/common/TestimonialCard';
import { ReviewModel } from '@/domains/review/model';

export interface FeaturedReviewsSectionProps {
  reviews: ReviewModel[];
}

export function FeaturedReviewsSection({ reviews }: FeaturedReviewsSectionProps) {
  if (reviews.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="container text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-bg-alt rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-muted-foreground/50">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">No Reviews Yet</h2>
          <p className="text-muted-foreground">
            We haven&apos;t collected any public reviews yet. Be the first to share your experience after completing a test!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white relative">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="section__title">Patient Experiences</h2>
          <p className="section__subtitle">
            Real stories from our patients who trust Agam Diagnostics with their health.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <TestimonialCard 
              key={review.id}
              quote={review.comment}
              authorName={review.displayName}
              authorRole={review.verified ? 'Verified Patient' : 'Patient'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
