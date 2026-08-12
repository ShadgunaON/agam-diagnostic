export interface InvoiceItem {
  id: string;
  name: string;
  type: 'Test' | 'Package' | 'Service';
  price: number;
}

export interface InvoiceModel {
  id: string;
  bookingId: string;
  patientId: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: 'Paid' | 'Unpaid' | 'Pending';
  paidAt?: string;
  paymentMethod?: string;
  receivedBy?: string;
  createdAt: string;
  updatedAt: string;
}
