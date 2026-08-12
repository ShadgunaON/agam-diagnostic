import { IBookingRepository } from '@/domains/booking/repository';

import { InvoiceService } from './InvoiceService';

export class BookingService {
  constructor(
    private readonly repository: IBookingRepository,
    private readonly invoiceService?: InvoiceService
  ) {}

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
    const res = await this.repository.create(booking);
    if (res.isSuccess && this.invoiceService) {
      await this.invoiceService.generateFromBooking(res.value);
    }
    return res;
  }

  async updateBookingStatus(id: string, status: import('@/domains/booking/model').BookingModel['status']) {
    return this.repository.updateStatus(id, status);
  }
}
