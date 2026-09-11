import { Result, success as resultSuccess, failure as resultFailure } from '@/shared/result';
import { InvoiceService } from './InvoiceService';

export type BookingCreateResult = import('@/domains/booking/model').BookingModel & { invoiceId?: string };

export class BookingService {
  private collectionService?: import('./CollectionService').CollectionService;

  constructor(
    private readonly invoiceService?: InvoiceService
  ) {}

  setCollectionService(service: import('./CollectionService').CollectionService) {
    this.collectionService = service;
  }

  private async _graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      const token = typeof window !== 'undefined'
        ? (sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '')
        : '';
      const _url = typeof window === 'undefined' ? (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/api/graphql' : '/api/graphql';
      const response = await fetch(_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }), cache: 'no-store',
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errText}`);
      }
      const { data, errors } = await response.json();
      if (errors?.length) { 
        console.error('GraphQL errors:', errors); 
        throw new Error(errors[0].message);
      }
      return data as T;
    } catch (err: any) {
      console.error('GraphQL fetch failed:', err);
      throw err;
    }
  }

  async getAdminWorkspace(params?: {
    limit?: number;
    cursor?: string | null;
    status?: string;
    tab?: string;
    sort?: string;
    search?: string;
  }): Promise<import('@/shared/result').Result<{ queue: import('@/domains/booking/model').BookingModel[]; nextCursor: string | null; totalFiltered: number }>> {
    const { limit = 20, cursor = null, status = 'All', tab = 'All', sort = 'date_newest', search = '' } = params || {};
    const data = await this._graphqlFetch<{
      adminBookingsWorkspace: { queue: import('@/domains/booking/model').BookingModel[]; nextCursor: string | null; totalFiltered: number };
    }>(
      `query AdminBookingsWorkspace($limit: Int, $cursor: String, $status: String, $tab: String, $sort: String, $search: String) {
        adminBookingsWorkspace(limit: $limit, cursor: $cursor, status: $status, tab: $tab, sort: $sort, search: $search) {
          queue {
            id patientId status createdAt
            patient { name phone email }
            collection { type date timeSlot address }
            payment { total status method }
            items { name type }
          }
          nextCursor
          totalFiltered
        }
      }`,
      { limit, cursor, status, tab, sort, search }
    );
    if (data?.adminBookingsWorkspace) return resultSuccess(data.adminBookingsWorkspace);
    return resultFailure(new Error('Failed to load bookings workspace'));
  }

  async getById(id: string): Promise<import('@/shared/result').Result<import('@/domains/booking/model').BookingModel>> {
    const data = await this._graphqlFetch<{
      bookingById: import('@/domains/booking/model').BookingModel | null;
    }>(
      `query BookingById($id: ID!) {
        bookingById(id: $id) {
          id patientId status createdAt
          patient { name phone email }
          collection { type date timeSlot address }
          payment { total status method }
          items { name type }
        }
      }`,
      { id }
    );
    if (data?.bookingById) return resultSuccess(data.bookingById);
    return resultFailure(new Error('Booking not found'));
  }

  async getByIdGql(id: string) {
    return this.getById(id);
  }

  async getMyBookingsGql(): Promise<import('@/shared/result').Result<import('@/domains/booking/model').BookingModel[]>> {
    const res = await this.getRecent(100);
    return res;
  }

  async getAll(): Promise<Result<import('@/domains/booking/model').BookingModel[]>> {
    return this.getRecent(100);
  }

  async getByPatientId(patientId: string): Promise<Result<import('@/domains/booking/model').BookingModel[]>> {
    const data = await this._graphqlFetch<{ bookingsByPatient: import('@/domains/booking/model').BookingModel[] }>(
      `query BookingsByPatient($patientId: ID!) {
        bookingsByPatient(patientId: $patientId) {
          id patientId status createdAt
          patient { name phone email }
          collection { type date timeSlot address }
          payment { total status method }
          items { name type }
        }
      }`,
      { patientId }
    );
    if (data?.bookingsByPatient) return resultSuccess(data.bookingsByPatient);
    return resultFailure(new Error('Failed to load bookings'));
  }

  async getRecent(limit = 10): Promise<Result<import('@/domains/booking/model').BookingModel[]>> {
    const data = await this._graphqlFetch<{ recentBookings: import('@/domains/booking/model').BookingModel[] }>(
      `query RecentBookings($limit: Int) {
        recentBookings(limit: $limit) {
          id patientId status createdAt
          patient { name phone email }
          collection { type date timeSlot address }
          payment { total status method }
          items { name type }
        }
      }`,
      { limit }
    );
    if (data?.recentBookings) return resultSuccess(data.recentBookings);
    return resultFailure(new Error('Failed to load recent bookings'));
  }

  async createBooking(booking: Omit<import('@/domains/booking/model').BookingModel, 'id' | 'createdAt' | 'status'>, options?: { idempotencyKey?: string }): Promise<Result<BookingCreateResult>> {
    try {
      const data = await this._graphqlFetch<{ createBooking: BookingCreateResult }>(
        `mutation CreateBooking($input: String!, $idempotencyKey: String) {
          createBooking(input: $input, idempotencyKey: $idempotencyKey) {
            id patientId status createdAt invoiceId
            patient { name phone email }
            collection { type date timeSlot address }
            payment { total status method }
            items { name type }
          }
        }`,
        { input: JSON.stringify(booking), idempotencyKey: options?.idempotencyKey || `idem_${Date.now()}` }
      );
      if (data?.createBooking) return resultSuccess(data.createBooking);
      return resultFailure(new Error('Failed to create booking (Unknown GraphQL error)'));
    } catch (err: any) {
      return resultFailure(new Error(err.message || 'Failed to create booking'));
    }
  }

  async updateBookingStatus(id: string, status: import('@/domains/booking/model').BookingModel['status']): Promise<Result<boolean>> {
    const data = await this._graphqlFetch<{ updateBookingStatus: boolean }>(
      `mutation UpdateBookingStatus($id: ID!, $status: String!) {
        updateBookingStatus(id: $id, status: $status)
      }`,
      { id, status }
    );
    if (data?.updateBookingStatus !== undefined) return resultSuccess(data.updateBookingStatus);
    return resultFailure(new Error('Failed to update booking status'));
  }

  async updatePaymentStatus(id: string, status: import('@/domains/booking/model').BookingModel['payment']['status']): Promise<Result<boolean>> {
    const data = await this._graphqlFetch<{ updateBookingPaymentStatus: boolean }>(
      `mutation UpdateBookingPaymentStatus($id: ID!, $status: String!) {
        updateBookingPaymentStatus(id: $id, status: $status)
      }`,
      { id, status }
    );
    if (data?.updateBookingPaymentStatus !== undefined) return resultSuccess(data.updateBookingPaymentStatus);
    return resultFailure(new Error('Failed to update payment status'));
  }
}
