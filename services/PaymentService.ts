import { InvoiceService } from './InvoiceService';
import { Result, success, failure } from '@/shared/result';

export interface IPaymentProvider {
  processPayment(invoiceId: string, amount: number, method: string, shouldSucceed?: boolean): Promise<Result<{ transactionId?: string, redirectUrl?: string }>>;
  checkStatus(invoiceId: string): Promise<Result<any>>;
}

export class MockPaymentProvider implements IPaymentProvider {
  async processPayment(invoiceId: string, amount: number, method: string, shouldSucceed = true): Promise<Result<{ transactionId: string }>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (shouldSucceed) {
      return success({ transactionId: `TXN-${Date.now()}` });
    } else {
      return failure(new Error('Payment failed. Insufficient funds or card declined.'));
    }
  }

  async checkStatus(invoiceId: string): Promise<Result<any>> {
    return success({ paymentStatus: 'Paid' });
  }
}

export class ApiPaymentProvider implements IPaymentProvider {
  constructor(private readonly apiClient: import('@/lib/api/client').IApiClient) {}
  
  async processPayment(invoiceId: string, amount: number, method: string): Promise<Result<{ transactionId?: string, redirectUrl?: string }>> {
    try {
      const response = await this.apiClient.post<{ redirectUrl: string }>('/api/payments/create-order', {
        invoiceId
      });
      return success({ redirectUrl: response.data.redirectUrl });
    } catch (err: any) {
      return failure(err);
    }
  }

  async checkStatus(invoiceId: string): Promise<Result<any>> {
    try {
      const response = await this.apiClient.get<any>(`/api/payments/status/${invoiceId}`);
      return success(response.data);
    } catch (err: any) {
      return failure(err);
    }
  }
}

export class PaymentService {
  constructor(
    private readonly provider: IPaymentProvider,
    private readonly invoiceService: InvoiceService
  ) {}

  async processOnlinePayment(invoiceId: string, amount: number, method: string, shouldSucceed = true) {
    const paymentResult = await this.provider.processPayment(invoiceId, amount, method, shouldSucceed);
    
    if (paymentResult.isSuccess) {
      if (paymentResult.value.redirectUrl) {
        // PG redirect flow (e.g. PhonePe)
        // We do not record payment here; the webhook will handle it.
        return success({ success: true, redirectUrl: paymentResult.value.redirectUrl });
      } else {
        // Synchronous mock flow
        const invoiceResult = await this.invoiceService.recordPayment(invoiceId, method, 'ONLINE_SYSTEM');
        if (invoiceResult.isSuccess) {
          return success({ success: true, transactionId: paymentResult.value.transactionId });
        } else {
          return failure(invoiceResult.error!);
        }
      }
    } else {
      return failure(paymentResult.error!);
    }
  }

  async checkStatus(invoiceId: string): Promise<Result<any>> {
    return this.provider.checkStatus(invoiceId);
  }
}
