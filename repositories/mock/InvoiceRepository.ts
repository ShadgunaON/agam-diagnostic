import { IInvoiceRepository } from '@/domains/invoice/repository';
import { InvoiceModel } from '@/domains/invoice/model';
import { Result, success, failure } from '@/shared/result';
import { SharedMockAdapter } from '@/lib/storage/SharedMockAdapter';

export class MockInvoiceRepository implements IInvoiceRepository {
  private adapter: SharedMockAdapter<InvoiceModel[]>;

  constructor() {
    this.adapter = new SharedMockAdapter<InvoiceModel[]>('mock_invoices');
  }

  async getAll(): Promise<Result<InvoiceModel[]>> {
    const invoices = (await this.adapter.load()) || [];
    invoices.sort((a: InvoiceModel, b: InvoiceModel) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return success(invoices);
  }

  async getPaginated(params: { limit?: number; cursor?: string | null; status?: string; search?: string }): Promise<Result<{ data: InvoiceModel[]; nextCursor: string | null }>> {
    const invoices = (await this.adapter.load()) || [];
    let filtered = [...invoices].sort((a: InvoiceModel, b: InvoiceModel) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (params.status && params.status !== 'All') {
      filtered = filtered.filter(i => i.paymentStatus === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(i => i.id.toLowerCase().includes(q) || i.patientId.toLowerCase().includes(q));
    }
    const limit = params.limit || 20;
    const startIndex = params.cursor ? parseInt(params.cursor, 10) : 0;
    const endIndex = startIndex + limit;
    const data = filtered.slice(startIndex, endIndex);
    const nextCursor = endIndex < filtered.length ? endIndex.toString() : null;
    return success({ data, nextCursor });
  }

  async getById(id: string): Promise<Result<InvoiceModel>> {
    const invoices = (await this.adapter.load()) || [];
    const invoice = invoices.find((i: InvoiceModel) => i.id === id);
    if (!invoice) return failure(new Error('Invoice not found'));
    return success(invoice);
  }

  async getByPatientId(patientId: string): Promise<Result<InvoiceModel[]>> {
    const invoices = (await this.adapter.load()) || [];
    const filtered = invoices.filter((i: InvoiceModel) => i.patientId === patientId);
    filtered.sort((a: InvoiceModel, b: InvoiceModel) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return success(filtered);
  }

  async create(invoiceParams: Omit<InvoiceModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<InvoiceModel>> {
    const id = `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const now = new Date().toISOString();
    
    const newInvoice: InvoiceModel = {
      ...invoiceParams,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    const invoices = (await this.adapter.load()) || [];
    invoices.push(newInvoice);
    await this.adapter.save(invoices);
    return success(newInvoice);
  }

  async updateStatus(id: string, status: InvoiceModel['paymentStatus']): Promise<Result<InvoiceModel>> {
    return this.update(id, { paymentStatus: status });
  }

  async updatePaymentMethod(id: string, method: string): Promise<Result<InvoiceModel>> {
    return this.update(id, { paymentMethod: method });
  }

  async update(id: string, updates: Partial<InvoiceModel>): Promise<Result<InvoiceModel>> {
    const invoices = (await this.adapter.load()) || [];
    const index = invoices.findIndex((i: InvoiceModel) => i.id === id);
    if (index === -1) return failure(new Error('Invoice not found'));
    
    const updated = {
      ...invoices[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    invoices[index] = updated;
    await this.adapter.save(invoices);
    return success(updated);
  }
}
