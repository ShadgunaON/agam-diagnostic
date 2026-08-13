export type ReviewStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ReviewModel {
  id: string;
  patientId: string;
  bookingId: string;
  rating: number; // 1 to 5
  comment: string;
  displayName: string;
  status: ReviewStatus;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}
