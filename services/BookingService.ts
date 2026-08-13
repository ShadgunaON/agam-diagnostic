import { IBookingRepository } from '@/domains/booking/repository';

import { InvoiceService } from './InvoiceService';

export class BookingService {
  private collectionService?: import('./CollectionService').CollectionService;

  constructor(
    private readonly repository: IBookingRepository,
    private readonly invoiceService?: InvoiceService
  ) {}

  setCollectionService(service: import('./CollectionService').CollectionService) {
    this.collectionService = service;
  }

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
    if (res.isSuccess) {
      if (this.invoiceService) {
        await this.invoiceService.generateFromBooking(res.value);
      }
      if (this.collectionService) {
        await this.collectionService.createFromBooking(res.value);
      }
    }
    return res;
  }

  async updateBookingStatus(id: string, status: import('@/domains/booking/model').BookingModel['status']) {
    const res = await this.repository.updateStatus(id, status);
    if (res.isSuccess && status === 'Completed' && this.collectionService) {
      const collectionsRes = await this.collectionService.getAll();
      if (collectionsRes.isSuccess) {
        const matchingTask = collectionsRes.value.find(t => t.bookingId === id);
        if (matchingTask) {
          await this.collectionService.updateTask(matchingTask.id, { status: 'Completed' });
        }
      }
    }
    return res;
  }

  async updatePaymentStatus(id: string, status: import('@/domains/booking/model').BookingModel['payment']['status']) {
    return this.repository.updatePaymentStatus(id, status);
  }
}
