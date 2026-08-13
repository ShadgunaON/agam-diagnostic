import { IReviewRepository } from '@/domains/review/repository';
import { ReviewModel, ReviewStatus } from '@/domains/review/model';
import { Result, success, failure } from '@/shared/result';
import { SharedMockAdapter } from '@/lib/storage/SharedMockAdapter';

const initialReviews: ReviewModel[] = [
  {
    id: 'REV-101',
    patientId: 'usr_existing_1',
    bookingId: 'B-1001',
    rating: 5,
    comment: 'Very professional lab with fast results. The home collection service was excellent — the phlebotomist was on time, gentle, and thorough. Got my reports the same day via WhatsApp. I will definitely be recommending this place to my friends and family.',
    displayName: 'Rajesh Kumar',
    status: 'Approved',
    verified: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'REV-102',
    patientId: 'usr_existing_2',
    bookingId: 'B-1002',
    rating: 5,
    comment: 'Agam Diagnostics is the best lab I\'ve visited in Madurai. The staff is courteous, the equipment looks modern, and the reports are detailed and accurate. Highly recommended for genetic testing!',
    displayName: 'Priya Sundaram',
    status: 'Approved',
    verified: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'REV-103',
    patientId: 'usr_existing_3',
    bookingId: 'B-1003',
    rating: 4,
    comment: 'Affordable and reliable. I got my master health checkup done and the reports were clear and well-explained. The NABL accreditation gives me total confidence in their quality.',
    displayName: 'Mohammed Farook',
    status: 'Approved',
    verified: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'REV-104',
    patientId: 'usr_existing_1',
    bookingId: 'B-1004',
    rating: 5,
    comment: 'Great service as always. Quick processing.',
    displayName: 'Rajesh Kumar',
    status: 'Pending',
    verified: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export class MockReviewRepository implements IReviewRepository {
  private adapter: SharedMockAdapter<ReviewModel[]>;

  constructor() {
    this.adapter = new SharedMockAdapter<ReviewModel[]>('agam_mock_reviews');
  }

  private async getReviews(): Promise<ReviewModel[]> {
    const loaded = await this.adapter.load();
    if (loaded && loaded.length > 0) {
      return loaded;
    }
    return [...initialReviews];
  }

  private async saveReviews(reviews: ReviewModel[]): Promise<void> {
    await this.adapter.save(reviews);
  }

  private generateNextId(reviews: ReviewModel[]): string {
    let maxId = 100;
    for (const r of reviews) {
      if (r.id.startsWith('REV-')) {
        const num = parseInt(r.id.replace('REV-', ''), 10);
        if (!isNaN(num) && num > maxId) {
          maxId = num;
        }
      }
    }
    return `REV-${maxId + 1}`;
  }

  async create(data: Omit<ReviewModel, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Result<ReviewModel>> {
    const reviews = await this.getReviews();
    
    // Check if review for this booking already exists
    const existing = reviews.find(r => r.bookingId === data.bookingId);
    if (existing) {
      return failure(new Error('A review for this booking already exists.'));
    }

    const newReview: ReviewModel = {
      ...data,
      id: this.generateNextId(reviews),
      status: 'Pending', // All new reviews require moderation
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    reviews.push(newReview);
    await this.saveReviews(reviews);
    
    return success(newReview);
  }

  async getById(id: string): Promise<Result<ReviewModel>> {
    const reviews = await this.getReviews();
    const review = reviews.find(r => r.id === id);
    if (!review) return failure(new Error('Review not found'));
    return success(review);
  }

  async getByBooking(bookingId: string): Promise<Result<ReviewModel | null>> {
    const reviews = await this.getReviews();
    const review = reviews.find(r => r.bookingId === bookingId) || null;
    return success(review);
  }

  async getByPatient(patientId: string): Promise<Result<ReviewModel[]>> {
    const reviews = await this.getReviews();
    const patientReviews = reviews.filter(r => r.patientId === patientId);
    return success(patientReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }

  async getApproved(): Promise<Result<ReviewModel[]>> {
    const reviews = await this.getReviews();
    const approved = reviews.filter(r => r.status === 'Approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
    return success(approved);
  }

  async getAll(): Promise<Result<ReviewModel[]>> {
    const reviews = await this.getReviews();
    return success(reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }

  async updateStatus(id: string, status: ReviewStatus): Promise<Result<ReviewModel>> {
    const reviews = await this.getReviews();
    const index = reviews.findIndex(r => r.id === id);
    if (index === -1) return failure(new Error('Review not found'));
    
    const updated = {
      ...reviews[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    reviews[index] = updated;
    await this.saveReviews(reviews);
    
    return success(updated);
  }

  async delete(id: string): Promise<Result<boolean>> {
    const reviews = await this.getReviews();
    const initialLength = reviews.length;
    const filtered = reviews.filter(r => r.id !== id);
    
    if (filtered.length === initialLength) {
      return failure(new Error('Review not found'));
    }
    
    await this.saveReviews(filtered);
    return success(true);
  }
}
