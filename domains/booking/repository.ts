import { Result } from '../../shared/result';
import { BookingModel } from './model';

export interface IBookingRepository {
  getById(id: string): Promise<Result<BookingModel>>;
}
