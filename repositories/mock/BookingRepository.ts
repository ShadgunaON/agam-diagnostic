import { IBookingRepository } from '@/domains/booking/repository';
import { BookingModel } from '@/domains/booking/model';
import { Result, success, failure } from '@/shared/result';
import { mockBookings, bookingData } from '@/data/bookings';
import { SharedMockAdapter } from '@/lib/storage/SharedMockAdapter';

export class MockBookingRepository implements IBookingRepository {
  private adapter: SharedMockAdapter<BookingModel[]>;
  private initialBookings: BookingModel[];

  constructor() {
    this.adapter = new SharedMockAdapter<BookingModel[]>('agam_mock_bookings_state');
    this.initialBookings = mockBookings.map(booking => ({
      ...booking,
      trustFeatures: bookingData.trustFeatures
    }));
  }

  private async getBookings(): Promise<BookingModel[]> {
    const loaded = await this.adapter.load();
    if (loaded && loaded.length > 0) {
      return loaded;
    }
    return [...this.initialBookings];
  }

  private async saveBookings(bookings: BookingModel[]): Promise<void> {
    await this.adapter.save(bookings);
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
    const bookings = await this.getBookings();
    const booking = bookings.find(b => b.id === id);
    if (!booking) {
      return failure(new Error('Booking not found'));
    }
    return success(booking);
  }

  async getAll(): Promise<Result<BookingModel[]>> {
    return success(await this.getBookings());
  }

  async getRecent(limit: number = 5): Promise<Result<BookingModel[]>> {
    const bookings = await this.getBookings();
    // Return the newest bookings first (simulating sorting by descending date/ID)
    const recent = [...bookings].reverse().slice(0, limit);
    return success(recent);
  }

  async create(bookingParams: Omit<BookingModel, 'id' | 'createdAt' | 'status'>): Promise<Result<BookingModel>> {
    const bookings = await this.getBookings();
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
    await this.saveBookings(bookings);
    return success(newBooking);
  }

  async updateStatus(id: string, status: BookingModel['status']): Promise<Result<BookingModel>> {
    const bookings = await this.getBookings();
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
        status: 'info',
        actor: 'System'
      }
    ];
    
    bookings[index] = updatedBooking;
    await this.saveBookings(bookings);
    return success(updatedBooking);
  }

  async updatePaymentStatus(id: string, paymentStatus: BookingModel['payment']['status']): Promise<Result<BookingModel>> {
    const bookings = await this.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) {
      return failure(new Error('Booking not found'));
    }

    const updatedBooking = { ...bookings[index] };
    updatedBooking.payment = { ...updatedBooking.payment, status: paymentStatus };
    
    // Also add a timeline event for the payment update
    updatedBooking.timeline = [
      ...updatedBooking.timeline,
      {
        id: `T-${Date.now()}`,
        title: `Payment ${paymentStatus}`,
        timestamp: 'Just now',
        status: paymentStatus === 'Paid' ? 'success' : (paymentStatus === 'Failed' ? 'danger' : 'info'),
        actor: 'System'
      }
    ];

    bookings[index] = updatedBooking;
    await this.saveBookings(bookings);
    return success(updatedBooking);
  }
}
