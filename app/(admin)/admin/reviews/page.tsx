"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { reviewService } from '@/services';
import { ReviewModel, ReviewStatus } from '@/domains/review/model';
import { AdminReviewKPIs } from '@/components/sections/admin/reviews/AdminReviewKPIs';
import { AdminReviewTable } from '@/components/sections/admin/reviews/AdminReviewTable';

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewModel[]>([]);
  const [stats, setStats] = useState<{ total: number; pending: number; approved: number; averageRating: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'All'>('All');
  const [ratingFilter, setRatingFilter] = useState<number | 'All'>('All');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset pagination when filters change
  useEffect(() => {
    setCursorStack([]);
  }, [debouncedSearch, statusFilter, ratingFilter]);

  const loadReviewsAndStats = async () => {
    setIsLoading(true);
    try {
      const currentCursor = cursorStack.length > 0 ? cursorStack[cursorStack.length - 1] : null;
      
      const [reviewsResult, statsResult] = await Promise.all([
        reviewService.getPaginatedReviewsGql({
          limit: 15,
          cursor: currentCursor,
          status: statusFilter,
          rating: ratingFilter,
          search: debouncedSearch
        }),
        // Fetch stats via GraphQL
        (async () => {
          try {
            const token = sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '';
            const res = await fetch('/api/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                query: `
                  query {
                    reviewStats {
                      total
                      pending
                      approved
                      averageRating
                    }
                  }
                `
              })
            });
            if (!res.ok) return null;
            const json = await res.json();
            return json.data?.reviewStats || null;
          } catch (e) {
            console.error("Failed to load review stats via GraphQL", e);
            return null;
          }
        })()
      ]);

      if (reviewsResult.isSuccess) {
        setReviews(reviewsResult.value.data);
        setNextCursor(reviewsResult.value.nextCursor);
      }
      if (statsResult !== undefined) {
        setStats(statsResult);
      }
    } catch (error) {
      console.error("Failed to load reviews and stats", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviewsAndStats();
  }, [debouncedSearch, statusFilter, ratingFilter, cursorStack]);

  const handleModerate = async (id: string, newStatus: ReviewStatus) => {
    try {
      const result = await reviewService.moderateReview(id, newStatus);
      if (result.isSuccess) {
        // Optimistically update
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      } else {
        alert("Failed to update status: " + result.error.message);
      }
    } catch (e: any) {
      alert("An error occurred: " + e.message);
    }
  };

  // Simple RBAC: Allow admin and doctor/lab_tech
  if (user?.role !== 'admin' && user?.role !== 'doctor') {
    return <div className="p-8 text-red-600">Access Denied. Insufficient permissions.</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 w-full custom-scrollbar">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Patient Reviews</h1>
        <p className="text-muted-foreground text-sm">
          Review and moderate patient feedback before it appears publicly on the Agam Diagnostics website.
        </p>
      </div>

      <AdminReviewKPIs stats={stats} />

      <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <input 
          type="text" 
          placeholder="Search by ID, Name, or Review Text..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:max-w-md px-4 py-2 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        />
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | 'All')}
            className="w-full md:w-auto px-4 py-2 rounded-lg border border-border focus:border-primary outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select 
            value={ratingFilter} 
            onChange={(e) => setRatingFilter(e.target.value === 'All' ? 'All' : parseInt(e.target.value))}
            className="w-full md:w-auto px-4 py-2 rounded-lg border border-border focus:border-primary outline-none"
          >
            <option value="All">All Ratings</option>
            <option value={5}>5 Stars</option>
            <option value={4}>4 Stars</option>
            <option value={3}>3 Stars</option>
            <option value={2}>2 Stars</option>
            <option value={1}>1 Star</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">Loading Reviews...</div>
      ) : (
        <>
          <AdminReviewTable reviews={reviews} onModerate={handleModerate} />
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
            <div className="text-sm font-medium text-muted-foreground">
              Showing Page {cursorStack.length + 1}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCursorStack(prev => prev.slice(0, -1))}
                disabled={cursorStack.length === 0 || isLoading}
                className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  if (nextCursor) setCursorStack(prev => [...prev, nextCursor]);
                }}
                disabled={!nextCursor || isLoading}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
