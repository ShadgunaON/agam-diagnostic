import { IBookingRepository } from '@/domains/booking/repository';

export class BookingService {
  constructor(private readonly repository: IBookingRepository) {}

  async getById(id: string) {
    return this.repository.getById(id);
  }
}
