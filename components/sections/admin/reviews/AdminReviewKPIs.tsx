import React from 'react';
import { ReviewModel } from '@/domains/review/model';

export interface AdminReviewKPIsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    averageRating: number;
  } | null;
}

export function AdminReviewKPIs({ stats }: AdminReviewKPIsProps) {
  const kpis = [
    { label: 'Total Reviews', value: stats ? stats.total : 'N/A', icon: '📋', color: 'text-blue-700' },
    { label: 'Pending Moderation', value: stats ? stats.pending : 'N/A', icon: '⏳', color: 'text-orange-700' },
    { label: 'Published Reviews', value: stats ? stats.approved : 'N/A', icon: '✅', color: 'text-green-700' },
    { label: 'Average Rating', value: stats ? stats.averageRating.toFixed(1) : 'N/A', icon: '⭐', color: 'text-yellow-700' },
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

