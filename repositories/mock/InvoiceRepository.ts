import { IInvoiceRepository } from '@/domains/invoice/repository';
import { InvoiceModel } from '@/domains/invoice/model';
import { Result, success, failure } from '@/shared/result';
import { LocalStorageAdapter } from '@/lib/storage/LocalStorageAdapter';

export class MockInvoiceRepository implements IInvoiceRepository {
  private adapter: LocalStorageAdapter<InvoiceModel[]>;

  constructor() {
    this.adapter = new LocalStorageAdapter<InvoiceModel[]>('mock_invoices');
  }

  async getAll(): Promise<Result<InvoiceModel[]>> {
    const invoices = this.adapter.load() || [];
    invoices.sort((a: InvoiceModel, b: InvoiceModel) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return success(invoices);
  }

  async getById(id: string): Promise<Result<InvoiceModel>> {
    const invoices = this.adapter.load() || [];
    const invoice = invoices.find((i: InvoiceModel) => i.id === id);
    if (!invoice) return failure(new Error('Invoice not found'));
    return success(invoice);
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
    
    const invoices = this.adapter.load() || [];
    invoices.push(newInvoice);
    this.adapter.save(invoices);
    return success(newInvoice);
  }

  async updateStatus(id: string, status: InvoiceModel['paymentStatus']): Promise<Result<InvoiceModel>> {
    const invoices = this.adapter.load() || [];
    const index = invoices.findIndex((i: InvoiceModel) => i.id === id);
    if (index === -1) return failure(new Error('Invoice not found'));
    
    const updated = {
      ...invoices[index],
      paymentStatus: status,
      updatedAt: new Date().toISOString()
    };
    
    invoices[index] = updated;
    this.adapter.save(invoices);
    return success(updated);
  }

  async update(id: string, updates: Partial<InvoiceModel>): Promise<Result<InvoiceModel>> {
    const invoices = this.adapter.load() || [];
    const index = invoices.findIndex((i: InvoiceModel) => i.id === id);
    if (index === -1) return failure(new Error('Invoice not found'));
    
    const updated = {
      ...invoices[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    invoices[index] = updated;
    this.adapter.save(invoices);
    return success(updated);
  }
}
