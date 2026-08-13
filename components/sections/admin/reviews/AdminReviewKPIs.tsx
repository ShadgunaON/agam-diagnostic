import React from 'react';
import { ReviewModel } from '@/domains/review/model';

export interface AdminReviewKPIsProps {
  reviews: ReviewModel[];
}

export function AdminReviewKPIs({ reviews }: AdminReviewKPIsProps) {
  const totalReviews = reviews.length;
  const pendingReviews = reviews.filter(r => r.status === 'Pending').length;
  const approvedReviews = reviews.filter(r => r.status === 'Approved').length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const kpis = [
    { label: 'Total Reviews', value: totalReviews, icon: '📋', color: 'text-blue-700' },
    { label: 'Pending Moderation', value: pendingReviews, icon: '⏳', color: 'text-orange-700' },
    { label: 'Published Reviews', value: approvedReviews, icon: '✅', color: 'text-green-700' },
    { label: 'Average Rating', value: avgRating, icon: '⭐', color: 'text-yellow-700' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-semibold mb-1 uppercase tracking-wider">{kpi.label}</p>
            <p className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
          </div>
          <div className="text-4xl opacity-80">{kpi.icon}</div>
        </div>
      ))}
    </div>
  );
}
