import { IBookingRepository } from '@/domains/booking/repository';
import { BookingModel } from '@/domains/booking/model';
import { Result, failure } from '@/shared/result';
import { ServerError } from '@/lib/api/errors';
import { IApiClient } from '@/lib/api/client';
import { toResult } from '@/lib/api/utils';

export class ApiBookingRepository implements IBookingRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getById(id: string): Promise<Result<BookingModel>> {
    return toResult(this.apiClient.get<BookingModel>(`/api/bookings/${id}`));
  }

  async getAll(): Promise<Result<BookingModel[]>> {
    return toResult(this.apiClient.get<BookingModel[]>('/api/bookings'));
  }

  async getRecent(limit: number = 10): Promise<Result<BookingModel[]>> {
    return toResult(this.apiClient.get<BookingModel[]>(`/api/bookings?limit=${limit}`));
  }

  async create(bookingParams: Omit<BookingModel, 'id' | 'createdAt' | 'status'>): Promise<Result<BookingModel>> {
    return toResult(this.apiClient.post<BookingModel>('/api/bookings', bookingParams));
  }

  async updateStatus(id: string, status: BookingModel['status']): Promise<Result<BookingModel>> {
    return toResult(this.apiClient.put<BookingModel>(`/api/bookings/${id}`, { status }));
  }

  async updatePaymentStatus(id: string, status: BookingModel['payment']['status']): Promise<Result<BookingModel>> {
    return toResult(this.apiClient.put<BookingModel>(`/api/bookings/${id}`, { paymentStatus: status }));
  }
}
