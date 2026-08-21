import { IInvoiceRepository } from '@/domains/invoice/repository';
import { InvoiceModel } from '@/domains/invoice/model';
import { Result } from '@/shared/result';
import { IApiClient } from '@/lib/api/client';
import { toResult } from '@/lib/api/utils';

export class ApiInvoiceRepository implements IInvoiceRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getAll(): Promise<Result<InvoiceModel[]>> {
    return toResult(this.apiClient.get<InvoiceModel[]>('/api/invoices'));
  }

  async getById(id: string): Promise<Result<InvoiceModel>> {
    return toResult(this.apiClient.get<InvoiceModel>(`/api/invoices/${id}`));
  }

  async create(invoice: Omit<InvoiceModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<InvoiceModel>> {
    return toResult(this.apiClient.post<InvoiceModel>('/api/invoices', invoice));
  }

  async updateStatus(id: string, status: InvoiceModel['paymentStatus']): Promise<Result<InvoiceModel>> {
    return toResult(this.apiClient.put<InvoiceModel>(`/api/invoices/${id}/status`, { status }));
  }

  async update(id: string, updates: Partial<InvoiceModel>): Promise<Result<InvoiceModel>> {
    return toResult(this.apiClient.put<InvoiceModel>(`/api/invoices/${id}`, updates));
  }
}
