import { ReviewModel, ReviewStatus } from '@/domains/review/model';
import { Result, success, failure } from '@/shared/result';
import { BookingService } from './BookingService';

export class ReviewService {
  constructor(
    private bookingService: BookingService
  ) {}

  // ---------------------------------------------------------------------------
  // Shared GraphQL fetch helper
  // ---------------------------------------------------------------------------
  private async _graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      const token = typeof window !== 'undefined'
        ? (sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '')
        : '';
      const _url = typeof window === 'undefined' ? (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/api/graphql' : '/api/graphql';
      const response = await fetch(_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
      });
      if (!response.ok) return null;
      const { data, errors } = await response.json();
      if (errors?.length) { 
        console.error('GraphQL errors:', errors); 
        throw new Error(errors[0].message);
      }
      return data as T;
    } catch (err) {
      console.error('GraphQL fetch failed:', err);
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // GraphQL-backed admin reviews workspace
  // Replaces: reviewService.getPaginatedReviews() → REST GET /api/reviews
  // ---------------------------------------------------------------------------
  async getPaginatedReviewsGql(params?: {
    limit?: number;
    cursor?: string | null;
    status?: string;
    rating?: number | string;
    search?: string;
  }): Promise<Result<{ data: ReviewModel[]; nextCursor: string | null }>> {
    const { limit = 15, cursor = null, status = 'All', rating = 'All', search = '' } = params || {};
    try {
      const data = await this._graphqlFetch<{
        adminReviewsWorkspace: { queue: ReviewModel[]; nextCursor: string | null };
      }>(
        `query AdminReviewsWorkspace($limit: Int, $cursor: String, $status: String, $rating: String, $search: String) {
          adminReviewsWorkspace(limit: $limit, cursor: $cursor, status: $status, rating: $rating, search: $search) {
            queue {
              id patientId bookingId displayName status rating title content createdAt updatedAt
            }
            nextCursor
          }
        }`,
        { limit, cursor, status, rating: String(rating), search }
      );
      if (data?.adminReviewsWorkspace) {
        return success({ data: data.adminReviewsWorkspace.queue, nextCursor: data.adminReviewsWorkspace.nextCursor });
      }
      return failure(new Error('Failed to load reviews workspace'));
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  async getPaginatedReviews(params: { limit?: number; cursor?: string | null; status?: string; rating?: number | string; search?: string }): Promise<Result<{ data: ReviewModel[]; nextCursor: string | null }>> {
    return this.getPaginatedReviewsGql(params);
  }

  async canReview(bookingId: string): Promise<Result<boolean>> {
    const bookingRes = await this.bookingService.getById(bookingId);
    if (!bookingRes.isSuccess) {
      return failure(new Error('Booking not found'));
    }

    if (bookingRes.value.status !== 'Completed') {
      return failure(new Error('Reviews can only be submitted for completed services.'));
    }

    const existingReview = await this.getReviewForBooking(bookingId);
    if (!existingReview.isSuccess) {
      return failure(new Error('Failed to check existing reviews'));
    }

    if (existingReview.value !== null) {
      return failure(new Error('A review has already been submitted for this booking.'));
    }

    return success(true);
  }

  async submitReview(data: Omit<ReviewModel, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Result<ReviewModel>> {
    const canReviewRes = await this.canReview(data.bookingId);
    if (!canReviewRes.isSuccess) return failure(canReviewRes.error);
    
    try {
      const res = await this._graphqlFetch<{ createReview: ReviewModel }>(
        `mutation CreateReview($bookingId: String!, $rating: Int!, $comment: String!, $displayName: String) {
          createReview(bookingId: $bookingId, rating: $rating, comment: $comment, displayName: $displayName) {
            id patientId bookingId displayName status rating title content createdAt updatedAt
          }
        }`,
        { bookingId: data.bookingId, rating: data.rating, comment: data.comment, displayName: data.displayName }
      );
      return success(res!.createReview);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to submit review'));
    }
  }

  async moderateReview(id: string, newStatus: ReviewStatus): Promise<Result<ReviewModel>> {
    try {
      const res = await this._graphqlFetch<{ moderateReview: ReviewModel }>(
        `mutation ModerateReview($id: ID!, $status: String!) {
          moderateReview(id: $id, status: $status) {
            id patientId bookingId displayName status rating title content createdAt updatedAt
          }
        }`,
        { id, status: newStatus }
      );
      return success(res!.moderateReview);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to moderate review'));
    }
  }

  async getReviewById(id: string): Promise<Result<ReviewModel>> {
    try {
      const res = await this._graphqlFetch<{ reviewById: ReviewModel }>(
        `query ReviewById($id: ID!) {
          reviewById(id: $id) {
            id patientId bookingId displayName status rating title content createdAt updatedAt
          }
        }`,
        { id }
      );
      if (!res?.reviewById) return failure(new Error('Review not found'));
      return success(res.reviewById);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get review'));
    }
  }

  async getReviewsByPatient(patientId: string): Promise<Result<ReviewModel[]>> {
    try {
      const res = await this._graphqlFetch<{ reviewsByPatient: ReviewModel[] }>(
        `query ReviewsByPatient($patientId: String) {
          reviewsByPatient(patientId: $patientId) {
            id patientId bookingId displayName status rating title content createdAt updatedAt
          }
        }`,
        { patientId }
      );
      return success(res?.reviewsByPatient || []);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get reviews'));
    }
  }

  async getReviewForBooking(bookingId: string): Promise<Result<ReviewModel | null>> {
    try {
      const res = await this._graphqlFetch<{ reviewByBooking: ReviewModel }>(
        `query ReviewByBooking($bookingId: String!) {
          reviewByBooking(bookingId: $bookingId) {
            id patientId bookingId displayName status rating title content createdAt updatedAt
          }
        }`,
        { bookingId }
      );
      return success(res?.reviewByBooking || null);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to check review'));
    }
  }

  async getAllReviews(): Promise<Result<ReviewModel[]>> {
    try {
      const res = await this._graphqlFetch<{ allReviews: ReviewModel[] }>(
        `query {
          allReviews {
            id patientId bookingId displayName status rating title content createdAt updatedAt
          }
        }`
      );
      return success(res?.allReviews || []);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get all reviews'));
    }
  }

  async getPublicReviews(): Promise<Result<ReviewModel[]>> {
    try {
      const res = await this._graphqlFetch<{ publicReviews: ReviewModel[] }>(
        `query {
          publicReviews {
            id patientId bookingId displayName status rating title content createdAt updatedAt
          }
        }`
      );
      return success(res?.publicReviews || []);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get public reviews'));
    }
  }
}
