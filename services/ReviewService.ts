import { IReviewRepository } from '@/domains/review/repository';
import { ReviewModel, ReviewStatus } from '@/domains/review/model';
import { Result, success, failure } from '@/shared/result';
import { IBookingRepository } from '@/domains/booking/repository';

export class ReviewService {
  constructor(
    private reviewRepository: IReviewRepository,
    private bookingRepository: IBookingRepository
  ) {}

  /**
   * Determine if a user can review a specific booking.
   */
  async canReview(bookingId: string): Promise<Result<boolean>> {
    // Check if booking is completed
    const bookingRes = await this.bookingRepository.getById(bookingId);
    if (!bookingRes.isSuccess) {
      return failure(new Error('Booking not found'));
    }

    if (bookingRes.value.status !== 'Completed') {
      return failure(new Error('Reviews can only be submitted for completed services.'));
    }

    // Check if review already exists
    const existingReview = await this.reviewRepository.getByBooking(bookingId);
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
    if (!canReviewRes.isSuccess) {
      return failure(canReviewRes.error);
    }
    return this.reviewRepository.create(data);
  }

  async moderateReview(id: string, newStatus: ReviewStatus): Promise<Result<ReviewModel>> {
    return this.reviewRepository.updateStatus(id, newStatus);
  }

  async getReviewById(id: string): Promise<Result<ReviewModel>> {
    return this.reviewRepository.getById(id);
  }

  async getReviewsByPatient(patientId: string): Promise<Result<ReviewModel[]>> {
    return this.reviewRepository.getByPatient(patientId);
  }

  async getReviewForBooking(bookingId: string): Promise<Result<ReviewModel | null>> {
    return this.reviewRepository.getByBooking(bookingId);
  }

  async getAllReviews(): Promise<Result<ReviewModel[]>> {
    return this.reviewRepository.getAll();
  }

  async getPublicReviews(): Promise<Result<ReviewModel[]>> {
    return this.reviewRepository.getApproved();
  }
}
