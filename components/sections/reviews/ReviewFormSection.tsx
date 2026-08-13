"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { reviewService } from '@/services';
import { Button } from '@/components/ui/Button';
import { BookingModel } from '@/domains/booking/model';

export interface ReviewFormSectionProps {
  booking: BookingModel;
}

export function ReviewFormSection({ booking }: ReviewFormSectionProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <div className="bg-white border border-border rounded-2xl p-10 text-center shadow-sm max-w-xl mx-auto mt-12 mb-20">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Thank you for sharing your experience.</h2>
        <p className="text-muted-foreground mb-8">
          Your review has been submitted and is awaiting approval by our moderation team.
        </p>
        <Button onClick={() => router.push('/bookings')} className="btn btn--primary">
          Return to My Bookings
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (comment.trim().length < 10) {
      setError('Please provide a comment with at least 10 characters.');
      return;
    }
    if (!user) {
      setError('You must be logged in to submit a review.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await reviewService.submitReview({
        patientId: user.id,
        bookingId: booking.id,
        rating,
        comment,
        displayName: user.fullName || 'Verified Patient',
        verified: true
      });

      if (result.isSuccess) {
        setIsSuccess(true);
      } else {
        setError(result.error.message || 'Failed to submit review.');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-12 bg-white p-8 md:p-12 border border-border rounded-2xl shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">How was your experience with Agam Diagnostics?</h2>
        <div className="bg-bg-alt rounded-xl p-4 text-left inline-block w-full max-w-md">
          <div className="text-sm text-muted-foreground mb-1">Booking: <strong className="text-foreground">{booking.id}</strong></div>
          <div className="text-sm text-muted-foreground mb-1">Service: <strong className="text-foreground">{booking.items.map(i => i.name).join(', ')}</strong></div>
          <div className="text-sm text-muted-foreground">Date: <strong className="text-foreground">{booking.collection.date}</strong></div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-bold text-foreground mb-4 text-center">How would you rate your experience?</label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} stars`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={(hoverRating || rating) >= star ? 'var(--color-warning)' : 'transparent'}
                  stroke={(hoverRating || rating) >= star ? 'var(--color-warning)' : 'var(--color-border)'}
                  strokeWidth="2"
                  className="w-10 h-10 transition-colors"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-bold text-foreground mb-2">Your Review</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you liked or what could be improved..."
            className="w-full min-h-[150px] p-4 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-y"
            aria-required="true"
          />
          <p className="text-xs text-muted-foreground mt-2 text-right">
            {comment.length} / 500 characters
          </p>
        </div>

        <Button 
          type="submit" 
          className="btn btn--primary w-full py-4 text-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </div>
  );
}
