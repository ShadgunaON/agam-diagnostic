import { IBookingRepository } from '@/domains/booking/repository';
import { BookingModel } from '@/domains/booking/model';
import { Result, success } from '@/shared/result';
import { IApiClient } from '@/lib/api/client';
import { toResult } from '@/lib/api/utils';

export function normalizeBooking(raw: any): BookingModel {
  if (!raw || typeof raw !== 'object') {
    return {
      id: 'unknown',
      patient: { name: 'Unknown Patient', phone: 'N/A', email: '', age: 0, gender: 'Unknown' },
      collection: { type: 'Home Collection', date: new Date().toISOString().split('T')[0], timeSlot: 'Flexible' },
      items: [],
      payment: { total: 0, status: 'Pending', method: 'Online' },
      status: 'Pending',
      timeline: [],
      createdAt: new Date().toISOString(),
    };
  }

  // 1. Patient Details
  const patientObj = raw.patient && typeof raw.patient === 'object' ? raw.patient : {};
  const patient = {
    name: patientObj.name || raw.patientName || raw.fullName || 'Unknown Patient',
    phone: patientObj.phone || raw.patientPhone || raw.phone || raw.mobile || 'N/A',
    email: patientObj.email || raw.patientEmail || raw.email || '',
    age: typeof patientObj.age === 'number' ? patientObj.age : (parseInt(raw.age, 10) || 0),
    gender: patientObj.gender || raw.gender || 'Unknown',
  };

  // 2. Collection Details
  const collectionObj = raw.collection && typeof raw.collection === 'object' ? raw.collection : {};
  const collection = {
    type: (collectionObj.type || raw.collectionType || (raw.type === 'Lab Visit' ? 'Lab Visit' : 'Home Collection')) as BookingModel['collection']['type'],
    date: collectionObj.date || raw.scheduledDate || raw.date || (raw.createdAt ? new Date(raw.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
    timeSlot: collectionObj.timeSlot || raw.timeSlot || raw.slot || 'Flexible',
    address: collectionObj.address || raw.address || undefined,
    assignedPhlebotomist: collectionObj.assignedPhlebotomist || raw.assignedPhlebotomist || raw.phlebotomist || undefined,
  };

  // 3. Test / Package Items
  const rawItems = Array.isArray(raw.items) ? raw.items : (Array.isArray(raw.tests) ? raw.tests : []);
  const items = rawItems.map((item: any) => ({
    name: typeof item === 'string' ? item : (item?.name || item?.title || 'Diagnostic Test'),
    type: (item?.type === 'Package' ? 'Package' : 'Test') as 'Package' | 'Test',
    price: typeof item?.price === 'number' ? item.price : (Number(item?.amount) || 0),
  }));

  // 4. Payment Details
  const paymentObj = raw.payment && typeof raw.payment === 'object' ? raw.payment : {};
  const payment = {
    total: typeof paymentObj.total === 'number' ? paymentObj.total : (typeof raw.total === 'number' ? raw.total : (Number(raw.amount) || 0)),
    status: (paymentObj.status || raw.paymentStatus || (raw.status === 'Completed' ? 'Paid' : 'Pending')) as BookingModel['payment']['status'],
    method: paymentObj.method || raw.paymentMethod || 'Online',
  };

  // 5. Timeline Events
  const rawTimeline = Array.isArray(raw.timeline) ? raw.timeline : [];
  const timeline = rawTimeline.map((t: any, idx: number) => ({
    id: t.id || `tl_${idx}`,
    title: t.title || t.status || 'Event',
    description: t.description || undefined,
    timestamp: t.timestamp || raw.createdAt || new Date().toISOString(),
    status: t.status || 'info',
    actor: t.actor || undefined,
  }));

  return {
    id: String(raw.id || raw.bookingId || (raw.PK ? raw.PK.replace('BOOKING#', '') : `bk_${Date.now()}`)),
    patientId: raw.patientId || patientObj.id || undefined,
    patient,
    collection,
    items,
    payment,
    status: (raw.status || 'Pending') as BookingModel['status'],
    timeline,
    createdAt: raw.createdAt || new Date().toISOString(),
    trustFeatures: Array.isArray(raw.trustFeatures) ? raw.trustFeatures : undefined,
  };
}

export class ApiBookingRepository implements IBookingRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getById(id: string): Promise<Result<BookingModel>> {
    const res = await toResult(this.apiClient.get<BookingModel>(`/api/bookings/${id}`));
    if (res.isSuccess && res.value) {
      return success(normalizeBooking(res.value));
    }
    return res;
  }

  async getAll(): Promise<Result<BookingModel[]>> {
    const res = await toResult(this.apiClient.get<BookingModel[]>('/api/bookings'));
    if (res.isSuccess) {
      const list = Array.isArray(res.value) ? res.value.map(normalizeBooking) : [];
      return success(list);
    }
    return res;
  }

  async getByPatientId(patientId: string): Promise<Result<BookingModel[]>> {
    const res = await toResult(this.apiClient.get<BookingModel[]>(`/api/bookings?patientId=${patientId}`));
    if (res.isSuccess) {
      const list = Array.isArray(res.value) ? res.value.map(normalizeBooking) : [];
      return success(list);
    }
    return res;
  }

  async getRecent(limit: number = 10): Promise<Result<BookingModel[]>> {
    const res = await toResult(this.apiClient.get<BookingModel[]>(`/api/bookings?limit=${limit}`));
    if (res.isSuccess) {
      const list = Array.isArray(res.value) ? res.value.map(normalizeBooking) : [];
      return success(list);
    }
    return res;
  }

  async create(bookingParams: Omit<BookingModel, 'id' | 'createdAt' | 'status'>, options?: { idempotencyKey?: string }): Promise<Result<BookingModel>> {
    const apiOptions = options?.idempotencyKey ? { headers: { 'Idempotency-Key': options.idempotencyKey } } : undefined;
    const res = await toResult(this.apiClient.post<BookingModel>('/api/bookings', bookingParams, apiOptions));
    if (res.isSuccess && res.value) {
      return success(normalizeBooking(res.value));
    }
    return res;
  }

  async updateStatus(id: string, status: BookingModel['status']): Promise<Result<BookingModel>> {
    const res = await toResult(this.apiClient.put<BookingModel>(`/api/bookings/${id}`, { status }));
    if (res.isSuccess && res.value) {
      return success(normalizeBooking(res.value));
    }
    return res;
  }

  async updatePaymentStatus(id: string, status: BookingModel['payment']['status']): Promise<Result<BookingModel>> {
    const res = await toResult(this.apiClient.put<BookingModel>(`/api/bookings/${id}`, { paymentStatus: status }));
    if (res.isSuccess && res.value) {
      return success(normalizeBooking(res.value));
    }
    return res;
  }
}
