import { Result } from '@/shared/result';
import { ReviewModel, ReviewStatus } from './model';

export interface IReviewRepository {
  create(review: Omit<ReviewModel, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Result<ReviewModel>>;
  updateStatus(id: string, status: ReviewStatus): Promise<Result<ReviewModel>>;
  getById(id: string): Promise<Result<ReviewModel>>;
  getByPatient(patientId: string): Promise<Result<ReviewModel[]>>;
  getByBooking(bookingId: string): Promise<Result<ReviewModel | null>>;
  getAll(): Promise<Result<ReviewModel[]>>;
  getPaginated(params: { limit?: number; cursor?: string | null; status?: string; rating?: number | string; search?: string }): Promise<Result<{ data: ReviewModel[]; nextCursor: string | null }>>;
  getApproved(): Promise<Result<ReviewModel[]>>;
}
