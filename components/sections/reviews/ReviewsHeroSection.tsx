import React from 'react';
import { Button } from '@/components/ui/Button';

export interface ReviewsHeroSectionProps {
  totalReviews: number;
  averageRating: number;
}

export function ReviewsHeroSection({ totalReviews, averageRating }: ReviewsHeroSectionProps) {
  return (
    <section className="bg-bg-alt py-12 md:py-16 relative overflow-hidden">
      <div className="container relative z-10 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">
          Trusted by patients across their health journey
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-8">
          Your health is our priority. Read what our patients have to say about their experience with Agam Diagnostics, and help others make confident healthcare decisions.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
          <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-border">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" fill="var(--color-warning)" stroke="none" className="w-6 h-6">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <div className="text-left border-l border-border pl-4">
              <div className="text-xl font-black text-foreground">{averageRating.toFixed(1)} / 5</div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Based on {totalReviews} reviews</div>
            </div>
          </div>
          <Button href="/bookings" className="btn btn--primary px-6 py-3 font-bold rounded-full">
            Write a Review
          </Button>
        </div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Reviews are verified and submitted by actual patients after service completion.
        </p>
      </div>
    </section>
  );
}
