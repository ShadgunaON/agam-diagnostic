import { Result } from '../../shared/result';
import { InvoiceModel } from './model';

export interface IInvoiceRepository {
  getAll(): Promise<Result<InvoiceModel[]>>;
  getPaginated(params: { limit?: number; cursor?: string | null; status?: string; search?: string }): Promise<Result<{ data: InvoiceModel[]; nextCursor: string | null }>>;
  getById(id: string): Promise<Result<InvoiceModel>>;
  getByPatientId(patientId: string): Promise<Result<InvoiceModel[]>>;
  create(invoice: Omit<InvoiceModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<InvoiceModel>>;
  updateStatus(id: string, status: InvoiceModel['paymentStatus']): Promise<Result<InvoiceModel>>;
  updatePaymentMethod(id: string, method: string): Promise<Result<InvoiceModel>>;
  update(id: string, updates: Partial<InvoiceModel>): Promise<Result<InvoiceModel>>;
}
