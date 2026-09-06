import { InvoiceModel, InvoiceItem } from '@/domains/invoice/model';
import { BookingModel } from '@/domains/booking/model';
import { Result, success, failure } from '@/shared/result';

export class InvoiceService {
  private bookingService?: import('./BookingService').BookingService;

  constructor() {}

  setBookingService(service: import('./BookingService').BookingService) {
    this.bookingService = service;
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
        body: JSON.stringify({ query, variables }),
      });
      if (!response.ok) return null;
      const { data, errors } = await response.json();
      if (errors?.length) { console.error('GraphQL errors:', errors); return null; }
      return data as T;
    } catch (err) {
      console.error('GraphQL fetch failed:', err);
      return null;
    }
  }

  async getAdminWorkspaceGql(params?: {
    limit?: number;
    cursor?: string | null;
    status?: string;
    search?: string;
  }): Promise<Result<{ data: InvoiceModel[]; nextCursor: string | null }>> {
    const { limit = 15, cursor = null, status = 'All', search = '' } = params || {};
    const data = await this._graphqlFetch<{ invoices: { data: InvoiceModel[]; nextCursor: string | null } }>(
      `query Invoices($limit: Int, $cursor: String, $status: String, $search: String) {
        invoices(limit: $limit, cursor: $cursor, status: $status, search: $search) {
          data {
            id patientId bookingId paymentStatus paymentMethod
            total subtotal tax discount paidAt receivedBy createdAt updatedAt
            items { id name type price }
          }
          nextCursor
        }
      }`,
      { limit, cursor, status, search }
    );
    if (data?.invoices) {
      return success({ data: data.invoices.data, nextCursor: data.invoices.nextCursor });
    }
    return failure(new Error('Failed to load invoices workspace'));
  }

  async getByIdGql(id: string): Promise<Result<InvoiceModel>> {
    const data = await this._graphqlFetch<{ invoiceById: InvoiceModel }>(
      `query InvoiceById($id: ID!) {
        invoiceById(id: $id) {
          id patientId bookingId paymentStatus paymentMethod
          total subtotal tax discount paidAt receivedBy createdAt updatedAt
          items { id name type price }
        }
      }`,
      { id }
    );
    if (data?.invoiceById) return success(data.invoiceById);
    return failure(new Error('Invoice not found'));
  }

  async getPaginated(params: { limit?: number; cursor?: string | null; status?: string; search?: string }) {
    return this.getAdminWorkspaceGql(params);
  }

  async getById(id: string) {
    return this.getByIdGql(id);
  }

  async getAll(): Promise<Result<InvoiceModel[]>> {
    const data = await this._graphqlFetch<{ invoices: { data: InvoiceModel[]; nextCursor: string | null } }>(
      `query Invoices {
        invoices(limit: 1000) {
          data {
            id patientId bookingId paymentStatus paymentMethod
            total subtotal tax discount paidAt receivedBy createdAt updatedAt
            items { id name type price }
          }
        }
      }`
    );
    if (data?.invoices) {
      return success(data.invoices.data);
    }
    return failure(new Error('Failed to load invoices'));
  }

  async getByPatientId(patientId: string): Promise<Result<InvoiceModel[]>> {
    const data = await this._graphqlFetch<{ invoicesByPatient: InvoiceModel[] }>(
      `query InvoicesByPatient($patientId: ID!) {
        invoicesByPatient(patientId: $patientId) {
          id patientId bookingId paymentStatus paymentMethod
          total subtotal tax discount paidAt receivedBy createdAt updatedAt
          items { id name type price }
        }
      }`,
      { patientId }
    );
    if (data?.invoicesByPatient) return success(data.invoicesByPatient);
    return failure(new Error('Failed to load invoices for patient'));
  }

  async updateStatus(id: string, status: InvoiceModel['paymentStatus']): Promise<Result<InvoiceModel>> {
    const data = await this._graphqlFetch<{ updateInvoiceStatus: InvoiceModel }>(
      `mutation UpdateInvoiceStatus($id: ID!, $status: String!) {
        updateInvoiceStatus(id: $id, status: $status) {
          id paymentStatus paymentMethod paidAt receivedBy
        }
      }`,
      { id, status }
    );
    if (data?.updateInvoiceStatus) return success(data.updateInvoiceStatus);
    return failure(new Error('Failed to update invoice status'));
  }

  async create(invoice: Omit<InvoiceModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<InvoiceModel>> {
    const data = await this._graphqlFetch<{ createInvoice: InvoiceModel }>(
      `mutation CreateInvoice($input: AWSJSON!) {
        createInvoice(input: $input) {
          id patientId bookingId paymentStatus paymentMethod total subtotal tax discount
          items { id name type price }
        }
      }`,
      { input: invoice }
    );
    if (data?.createInvoice) return success(data.createInvoice);
    return failure(new Error('Failed to create invoice'));
  }

  async generateFromBooking(booking: BookingModel): Promise<Result<InvoiceModel>> {
    const existingRes = await this.getAdminWorkspaceGql({ limit: 100 });
    if (existingRes.isSuccess) {
      const existing = existingRes.value.data.find(inv => inv.bookingId === booking.id);
      if (existing) {
        return success(existing);
      }
    }

    const items: InvoiceItem[] = booking.items.map((item, index) => ({
      id: `ITEM-${index}-${Date.now()}`,
      name: item.name,
      type: item.type === 'Package' ? 'Package' : 'Test',
      price: item.price
    }));

    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const discount = 0;
    const tax = subtotal * 0.05;
    const total = booking.payment.total;

    const invoiceParams: Omit<InvoiceModel, 'id' | 'createdAt' | 'updatedAt'> = {
      bookingId: booking.id,
      patientId: booking.patientId || booking.patient.phone || booking.patient.email,
      items,
      subtotal,
      discount,
      tax,
      total,
      paymentStatus: booking.payment.status === 'Paid' ? 'Paid' : 'Pending'
    };

    return this.create(invoiceParams);
  }

  async recordPayment(invoiceId: string, method: string, staffId: string): Promise<Result<InvoiceModel>> {
    const res = await this.getByIdGql(invoiceId);
    if (!res.isSuccess) return failure(new Error('Invoice not found'));
    
    if (res.value.paymentStatus === 'Paid') {
      return failure(new Error('Invoice is already paid'));
    }

    const updateRes = await this.updateStatus(invoiceId, 'Paid');

    if (updateRes.isSuccess && this.bookingService && res.value.bookingId) {
      await this.bookingService.updatePaymentStatus(res.value.bookingId, 'Paid');
    }

    return updateRes;
  }

  async setPaymentMethod(invoiceId: string, method: string): Promise<Result<InvoiceModel>> {
    const data = await this._graphqlFetch<{ updateInvoicePaymentMethod: InvoiceModel }>(
      `mutation UpdateInvoicePaymentMethod($id: ID!, $paymentMethod: String!) {
        updateInvoicePaymentMethod(id: $id, paymentMethod: $paymentMethod) {
          id paymentMethod
        }
      }`,
      { id: invoiceId, paymentMethod: method }
    );
    if (data?.updateInvoicePaymentMethod) return success(data.updateInvoicePaymentMethod);
    return failure(new Error('Failed to set payment method'));
  }
}
