import { IBookingRepository } from '@/domains/booking/repository';

export class BookingService {
  constructor(private readonly repository: IBookingRepository) {}

  async getById(id: string) {
    return this.repository.getById(id);
  }

  async getAll() {
    return this.repository.getAll();
  }

  async getRecent(limit?: number) {
    return this.repository.getRecent(limit);
  }

  async createBooking(booking: Omit<import('@/domains/booking/model').BookingModel, 'id' | 'createdAt' | 'status'>) {
    return this.repository.create(booking);
  }

  async updateBookingStatus(id: string, status: import('@/domains/booking/model').BookingModel['status']) {
    return this.repository.updateStatus(id, status);
  }
}
