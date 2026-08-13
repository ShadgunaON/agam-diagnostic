import { IBookingRepository } from '@/domains/booking/repository';
import { BookingModel } from '@/domains/booking/model';
import { Result, failure } from '@/shared/result';
import { ServerError } from '@/lib/api/errors';
import { IApiClient } from '@/lib/api/client';

export class ApiBookingRepository implements IBookingRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getById(_id: string): Promise<Result<BookingModel>> {
    void _id;
    return failure(new ServerError('Booking API not implemented'));
  }

  async getAll(): Promise<Result<BookingModel[]>> {
    return failure(new ServerError('Booking API not implemented'));
  }

  async getRecent(limit?: number): Promise<Result<BookingModel[]>> {
    void limit;
    return failure(new ServerError('Booking API not implemented'));
  }

  async create(bookingParams: Omit<BookingModel, 'id' | 'createdAt' | 'status'>): Promise<Result<BookingModel>> {
    void bookingParams;
    return failure(new ServerError('Booking API not implemented'));
  }

  async updateStatus(id: string, status: BookingModel['status']): Promise<Result<BookingModel>> {
    void id;
    void status;
    return failure(new ServerError('Booking API not implemented'));
  }

  async updatePaymentStatus(id: string, status: BookingModel['payment']['status']): Promise<Result<BookingModel>> {
    void id;
    void status;
    return failure(new ServerError('Booking API not implemented'));
  }
}
