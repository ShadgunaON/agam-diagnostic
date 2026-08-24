import { IBookingRepository } from '@/domains/booking/repository';
import { Result, success as resultSuccess } from '@/shared/result';
import { InvoiceService } from './InvoiceService';

/** Extended booking result that includes the generated invoice ID when available */
export type BookingCreateResult = import('@/domains/booking/model').BookingModel & { invoiceId?: string };

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

  async getByPatientId(patientId: string) {
    if (this.repository.getByPatientId) {
      return this.repository.getByPatientId(patientId);
    }
    // Fallback if not implemented in repo
    const all = await this.getAll();
    if (all.isSuccess) {
      return resultSuccess(all.value.filter(b => b.patientId === patientId));
    }
    return all;
  }

  async getRecent(limit?: number) {
    return this.repository.getRecent(limit);
  }

  async createBooking(booking: Omit<import('@/domains/booking/model').BookingModel, 'id' | 'createdAt' | 'status'>): Promise<Result<BookingCreateResult>> {
    const res = await this.repository.create(booking);
    if (res.isSuccess) {
      let invoiceId: string | undefined;
      if (this.invoiceService) {
        const invRes = await this.invoiceService.generateFromBooking(res.value);
        if (invRes.isSuccess) {
          invoiceId = invRes.value.id;
        }
      }
      if (this.collectionService) {
        await this.collectionService.createFromBooking(res.value);
      }
      return resultSuccess({ ...res.value, invoiceId });
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
