"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/common/AuthGuard';
import { reviewService, bookingService } from '@/services';
import { ReviewFormSection } from '@/components/sections/reviews/ReviewFormSection';
import { BookingModel } from '@/domains/booking/model';

export default function NewReviewPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingModel | null>(null);

  useEffect(() => {
    if (!user || !bookingId) return;

    const checkEligibility = async () => {
      try {
        const canReview = await reviewService.canReview(bookingId);
        if (!canReview.isSuccess) {
          setEligibilityError(canReview.error.message || 'You cannot review this booking.');
          return;
        }
        
        const bookingRes = await bookingService.getById(bookingId);
        if (bookingRes.isSuccess) {
          setBooking(bookingRes.value);
        } else {
          setEligibilityError('Booking not found.');
        }
      } catch (err: any) {
        setEligibilityError(err.message || 'An error occurred while checking eligibility.');
      } finally {
        setIsLoading(false);
      }
    };

    checkEligibility();
  }, [user, bookingId]);

  return (
    <AuthGuard>
      <div className="min-h-[80vh] bg-bg-alt py-12">
        <div className="container">
          {isLoading ? (
            <div className="text-center py-20 text-primary font-bold">
              Checking eligibility...
            </div>
          ) : eligibilityError ? (
            <div className="max-w-xl mx-auto my-12 bg-white p-8 text-center border border-border rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Cannot Write Review</h2>
              <p className="text-muted-foreground mb-8">{eligibilityError}</p>
              <button onClick={() => router.push('/bookings')} className="btn btn--primary">
                Return to My Bookings
              </button>
            </div>
          ) : booking ? (
            <ReviewFormSection booking={booking} />
          ) : null}
        </div>
      </div>
    </AuthGuard>
  );
}
