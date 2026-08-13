"use client";

import React, { useEffect, useState } from 'react';
import { reviewService } from '@/services';
import { ReviewModel } from '@/domains/review/model';
import { ReviewsHeroSection } from '@/components/sections/reviews/ReviewsHeroSection';
import { FeaturedReviewsSection } from '@/components/sections/reviews/FeaturedReviewsSection';
import { CTASection } from '@/components/common/CTASection';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const result = await reviewService.getPublicReviews();
        if (result.isSuccess) {
          setReviews(result.value);
        }
      } catch (error) {
        console.error("Failed to load reviews", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, []);

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-alt">
        <div className="text-primary font-bold text-lg">Loading Patient Experiences...</div>
      </div>
    );
  }

  return (
    <>
      <ReviewsHeroSection totalReviews={totalReviews} averageRating={averageRating} />
      
      {/* We can also add a RatingSummarySection if required, but for now the Hero acts as a strong summary. */}
      
      <FeaturedReviewsSection reviews={reviews.slice(0, 3)} />
      
      <CTASection 
        title="Share your experience"
        description="Your experience can help another patient make a confident choice."
        primaryActionLabel="Write a Review"
        primaryActionHref="/bookings"
      />
    </>
  );
}
