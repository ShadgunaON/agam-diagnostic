import { IReviewRepository } from '@/domains/review/repository';
import { ReviewModel, ReviewStatus } from '@/domains/review/model';
import { Result } from '@/shared/result';
import { IApiClient } from '@/lib/api/client';
import { toResult } from '@/lib/api/utils';

export class ApiReviewRepository implements IReviewRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async create(review: Omit<ReviewModel, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Result<ReviewModel>> {
    return toResult(this.apiClient.post<ReviewModel>('/api/reviews', review));
  }

  async updateStatus(id: string, status: ReviewStatus): Promise<Result<ReviewModel>> {
    return toResult(this.apiClient.put<ReviewModel>(`/api/reviews/${id}/status`, { status }));
  }

  async getById(id: string): Promise<Result<ReviewModel>> {
    return toResult(this.apiClient.get<ReviewModel>(`/api/reviews/${id}`));
  }

  async getByPatient(patientId: string): Promise<Result<ReviewModel[]>> {
    return toResult(this.apiClient.get<ReviewModel[]>(`/api/reviews?patientId=${encodeURIComponent(patientId)}`));
  }

  async getByBooking(bookingId: string): Promise<Result<ReviewModel | null>> {
    return toResult(this.apiClient.get<ReviewModel | null>(`/api/reviews?bookingId=${encodeURIComponent(bookingId)}`));
  }

  async getAll(): Promise<Result<ReviewModel[]>> {
    return toResult(this.apiClient.get<ReviewModel[]>('/api/reviews'));
  }

  async getApproved(): Promise<Result<ReviewModel[]>> {
    return toResult(this.apiClient.get<ReviewModel[]>('/api/reviews?status=Approved'));
  }
}
