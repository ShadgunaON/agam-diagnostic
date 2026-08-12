import { InvoiceService } from './InvoiceService';
import { Result, success, failure } from '@/shared/result';

export interface IPaymentProvider {
  processPayment(invoiceId: string, amount: number, method: string, shouldSucceed?: boolean): Promise<Result<{ transactionId: string }>>;
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
}

export class PaymentService {
  constructor(
    private readonly provider: IPaymentProvider,
    private readonly invoiceService: InvoiceService
  ) {}

  async processOnlinePayment(invoiceId: string, amount: number, method: string, shouldSucceed = true) {
    const paymentResult = await this.provider.processPayment(invoiceId, amount, method, shouldSucceed);
    
    if (paymentResult.isSuccess) {
      // Record payment via the existing invoice orchestrator.
      // We pass 'ONLINE_SYSTEM' to clearly differentiate from in-lab staff acting as the receiver.
      const invoiceResult = await this.invoiceService.recordPayment(invoiceId, method, 'ONLINE_SYSTEM');
      
      if (invoiceResult.isSuccess) {
        return success({ success: true, transactionId: paymentResult.value.transactionId });
      } else {
        return failure(invoiceResult.error!);
      }
    } else {
      return failure(paymentResult.error!);
    }
  }
}
