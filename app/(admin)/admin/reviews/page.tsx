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
  const [filteredReviews, setFilteredReviews] = useState<ReviewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'All'>('All');
  const [ratingFilter, setRatingFilter] = useState<number | 'All'>('All');

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const result = await reviewService.getAllReviews();
      if (result.isSuccess) {
        setReviews(result.value);
      }
    } catch (error) {
      console.error("Failed to load reviews", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    let filtered = [...reviews];

    if (statusFilter !== 'All') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (ratingFilter !== 'All') {
      filtered = filtered.filter(r => r.rating === ratingFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(r => 
        r.id?.toLowerCase().includes(q) ||
        r.displayName?.toLowerCase().includes(q) ||
        r.bookingId?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q)
      );
    }

    setFilteredReviews(filtered);
  }, [reviews, search, statusFilter, ratingFilter]);

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

      <AdminReviewKPIs reviews={reviews} />

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
        <AdminReviewTable reviews={filteredReviews} onModerate={handleModerate} />
      )}
    </div>
  );
}
