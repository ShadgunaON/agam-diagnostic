import React from 'react';
import { ReviewModel, ReviewStatus } from '@/domains/review/model';

export interface AdminReviewTableProps {
  reviews: ReviewModel[];
  onModerate: (id: string, newStatus: ReviewStatus) => void;
}

export function AdminReviewTable({ reviews, onModerate }: AdminReviewTableProps) {
  if (reviews.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-border shadow-sm text-center">
        <p className="text-muted-foreground font-medium">No reviews found matching the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-alt border-b border-border text-sm text-muted-foreground uppercase tracking-wider">
              <th className="p-4 font-bold">Review ID</th>
              <th className="p-4 font-bold">Patient & Booking</th>
              <th className="p-4 font-bold">Rating & Comment</th>
              <th className="p-4 font-bold">Date</th>
              <th className="p-4 font-bold text-center">Status</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {reviews.map((review) => (
              <tr key={review.id} className="border-b border-border hover:bg-bg-alt/50 transition-colors">
                <td className="p-4 align-top">
                  <div className="font-bold text-foreground">{review.id}</div>
                </td>
                <td className="p-4 align-top">
                  <div className="font-bold text-foreground">{review.displayName}</div>
                  <div className="text-xs text-muted-foreground">{review.bookingId}</div>
                  {review.verified && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">Verified</span>}
                </td>
                <td className="p-4 align-top max-w-sm">
                  <div className="flex gap-1 mb-1 text-warning">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <div className="text-muted-foreground line-clamp-3" title={review.comment}>
                    {review.comment}
                  </div>
                </td>
                <td className="p-4 align-top text-muted-foreground whitespace-nowrap">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 align-top text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    review.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    review.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {review.status}
                  </span>
                </td>
                <td className="p-4 align-top text-right">
                  <div className="flex flex-col gap-2 items-end">
                    {review.status === 'Pending' && (
                      <>
                        <button onClick={() => onModerate(review.id, 'Approved')} className="text-xs font-bold bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded hover:bg-green-100 transition-colors">Approve</button>
                        <button onClick={() => onModerate(review.id, 'Rejected')} className="text-xs font-bold bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded hover:bg-red-100 transition-colors">Reject</button>
                      </>
                    )}
                    {review.status === 'Approved' && (
                      <button onClick={() => onModerate(review.id, 'Rejected')} className="text-xs font-bold bg-bg-alt text-muted-foreground border border-border px-3 py-1 rounded hover:bg-gray-100 transition-colors">Unpublish</button>
                    )}
                    {review.status === 'Rejected' && (
                      <button onClick={() => onModerate(review.id, 'Approved')} className="text-xs font-bold bg-bg-alt text-muted-foreground border border-border px-3 py-1 rounded hover:bg-gray-100 transition-colors">Approve</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
