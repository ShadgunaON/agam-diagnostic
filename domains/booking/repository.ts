import { Result } from '../../shared/result';
import { BookingModel } from './model';

export interface IBookingRepository {
  getById(id: string): Promise<Result<BookingModel>>;
  getAll(): Promise<Result<BookingModel[]>>;
  getByPatientId?(patientId: string): Promise<Result<BookingModel[]>>;
  getRecent(limit?: number): Promise<Result<BookingModel[]>>;
  create(booking: Omit<BookingModel, 'id' | 'createdAt' | 'status'>): Promise<Result<BookingModel>>;
  updateStatus(id: string, status: BookingModel['status']): Promise<Result<BookingModel>>;
  updatePaymentStatus(id: string, status: BookingModel['payment']['status']): Promise<Result<BookingModel>>;
}
