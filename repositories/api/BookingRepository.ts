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
}
