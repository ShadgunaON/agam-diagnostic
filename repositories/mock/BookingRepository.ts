import { IBookingRepository } from '@/domains/booking/repository';
import { BookingModel } from '@/domains/booking/model';
import { Result, success } from '@/shared/result';
import { bookingData } from '@/data/booking';

export class MockBookingRepository implements IBookingRepository {
  async getById(_id: string): Promise<Result<BookingModel>> {
    void _id;
    return success(bookingData as unknown as BookingModel);
  }
}
