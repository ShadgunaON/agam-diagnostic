import { IInvoiceRepository } from '@/domains/invoice/repository';
import { InvoiceModel, InvoiceItem } from '@/domains/invoice/model';
import { BookingModel } from '@/domains/booking/model';
import { Result, success, failure } from '@/shared/result';

export class InvoiceService {
  constructor(private readonly repository: IInvoiceRepository) {}

  async getAll() {
    return this.repository.getAll();
  }

  async getById(id: string) {
    return this.repository.getById(id);
  }

  async updateStatus(id: string, status: InvoiceModel['paymentStatus']) {
    return this.repository.updateStatus(id, status);
  }

  async create(invoice: Omit<InvoiceModel, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.repository.create(invoice);
  }

  async generateFromBooking(booking: BookingModel): Promise<Result<InvoiceModel>> {
    // Check if an invoice already exists for this booking
    const existingRes = await this.repository.getAll();
    if (existingRes.isSuccess) {
      const existing = existingRes.value.find(inv => inv.bookingId === booking.id);
      if (existing) {
        return success(existing); // Return the existing invoice
      }
    }

    const items: InvoiceItem[] = booking.items.map((item, index) => ({
      id: `ITEM-${index}-${Date.now()}`,
      name: item.name,
      type: item.type === 'Package' ? 'Package' : 'Test', // Mapping to expected types
      price: item.price
    }));

    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const discount = 0; // Can be derived if booking has discounts
    const tax = subtotal * 0.05; // Dummy 5% tax or just use booking.payment.total
    const total = booking.payment.total; // Authoritative total from booking

    const invoiceParams: Omit<InvoiceModel, 'id' | 'createdAt' | 'updatedAt'> = {
      bookingId: booking.id,
      patientId: booking.patient.phone || booking.patient.email, // Using whatever id is available
      items,
      subtotal,
      discount,
      tax,
      total,
      paymentStatus: booking.payment.status === 'Paid' ? 'Paid' : 'Pending'
    };

    return this.repository.create(invoiceParams);
  }

  async recordPayment(invoiceId: string, method: string, staffId: string): Promise<Result<InvoiceModel>> {
    const res = await this.repository.getById(invoiceId);
    if (!res.isSuccess) return failure(new Error('Invoice not found'));
    
    if (res.value.paymentStatus === 'Paid') {
      return failure(new Error('Invoice is already paid'));
    }

    return this.repository.update(invoiceId, {
      paymentStatus: 'Paid',
      paymentMethod: method,
      paidAt: new Date().toISOString(),
      receivedBy: staffId
    });
  }
}
