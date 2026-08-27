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

  async createBooking(booking: Omit<import('@/domains/booking/model').BookingModel, 'id' | 'createdAt' | 'status'>, options?: { idempotencyKey?: string }): Promise<Result<BookingCreateResult>> {
    const res = await this.repository.create(booking, options);
    // Note: The backend now atomicially creates the booking, invoice, and collection task in a single DynamoDB transaction.
    // The orchestration code here has been removed.
    return res;
  }

  async updateBookingStatus(id: string, status: import('@/domains/booking/model').BookingModel['status']) {
    return this.repository.updateStatus(id, status);
  }

  async updatePaymentStatus(id: string, status: import('@/domains/booking/model').BookingModel['payment']['status']) {
    return this.repository.updatePaymentStatus(id, status);
  }
}
