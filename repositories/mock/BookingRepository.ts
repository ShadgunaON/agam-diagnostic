import { IBookingRepository } from '@/domains/booking/repository';
import { BookingModel } from '@/domains/booking/model';
import { Result, success, failure } from '@/shared/result';
import { mockBookings, bookingData } from '@/data/bookings';
import { LocalStorageAdapter } from '@/lib/storage/LocalStorageAdapter';

export class MockBookingRepository implements IBookingRepository {
  private adapter: LocalStorageAdapter<BookingModel[]>;
  private initialBookings: BookingModel[];

  constructor() {
    this.adapter = new LocalStorageAdapter<BookingModel[]>('agam_mock_bookings_state');
    this.initialBookings = mockBookings.map(booking => ({
      ...booking,
      trustFeatures: bookingData.trustFeatures
    }));
  }

  private getBookings(): BookingModel[] {
    const loaded = this.adapter.load();
    if (loaded && loaded.length > 0) {
      return loaded;
    }
    return [...this.initialBookings];
  }

  private saveBookings(bookings: BookingModel[]): void {
    this.adapter.save(bookings);
  }

  private generateNextId(bookings: BookingModel[]): string {
    let maxId = 1000;
    for (const b of bookings) {
      if (b.id.startsWith('B-')) {
        const num = parseInt(b.id.replace('B-', ''), 10);
        if (!isNaN(num) && num > maxId) {
          maxId = num;
        }
      }
    }
    return `B-${maxId + 1}`;
  }

  async getById(id: string): Promise<Result<BookingModel>> {
    const bookings = this.getBookings();
    const booking = bookings.find(b => b.id === id);
    if (!booking) {
      return failure(new Error('Booking not found'));
    }
    return success(booking);
  }

  async getAll(): Promise<Result<BookingModel[]>> {
    return success(this.getBookings());
  }

  async getRecent(limit: number = 5): Promise<Result<BookingModel[]>> {
    const bookings = this.getBookings();
    // Return the newest bookings first (simulating sorting by descending date/ID)
    const recent = [...bookings].reverse().slice(0, limit);
    return success(recent);
  }

  async create(bookingParams: Omit<BookingModel, 'id' | 'createdAt' | 'status'>): Promise<Result<BookingModel>> {
    const bookings = this.getBookings();
    const newId = this.generateNextId(bookings);
    
    // Formatting today's date for createdAt
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newBooking: BookingModel = {
      ...bookingParams,
      id: newId,
      createdAt: formattedDate,
      status: 'Pending',
      trustFeatures: bookingData.trustFeatures,
    };

    bookings.push(newBooking);
    this.saveBookings(bookings);
    return success(newBooking);
  }

  async updateStatus(id: string, status: BookingModel['status']): Promise<Result<BookingModel>> {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) {
      return failure(new Error('Booking not found'));
    }

    const updatedBooking = { ...bookings[index], status };
    
    // Also add a timeline event for the status update
    updatedBooking.timeline = [
      ...updatedBooking.timeline,
      {
        id: `T-${Date.now()}`,
        title: `Status updated to ${status}`,
        timestamp: 'Just now',
        status: status === 'Cancelled' ? 'danger' : 'info',
        actor: 'Admin'
      }
    ];

    bookings[index] = updatedBooking;
    this.saveBookings(bookings);
    return success(updatedBooking);
  }
}
