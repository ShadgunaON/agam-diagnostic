import { InvoiceService } from './InvoiceService';
import { Result, success, failure } from '@/shared/result';

// NEXT_PUBLIC_PAYMENT_MODE=manual_test activates the isolated dev/test payment UI.
// All other values (or unset) use the real PhonePe Sandbox/UAT.
export const isManualTestPaymentMode =
  process.env.NEXT_PUBLIC_PAYMENT_MODE === 'manual_test';

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
  constructor() {}
  
  private async _graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
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
      body: JSON.stringify({ query, variables }), cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GraphQL Network Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const json = await response.json();
    if (json.errors && json.errors.length > 0) {
      throw new Error(json.errors[0].message);
    }
    return json.data;
  }

  async processPayment(invoiceId: string, amount: number, method: string): Promise<Result<{ transactionId?: string, redirectUrl?: string }>> {
    try {
      const response = await this._graphqlFetch<{ createPaymentOrder: string }>(
        `mutation CreatePaymentOrder($invoiceId: ID!) {
          createPaymentOrder(invoiceId: $invoiceId)
        }`,
        { invoiceId }
      );

      const rawUrl = response?.createPaymentOrder;
      if (!rawUrl) return failure(new Error('No redirect URL received from payment gateway'));

      // Detect MANUAL_TEST sentinel prefix returned by Lambda when PAYMENT_MODE=manual_test.
      // Strip the prefix to get the real test page URL and pass it as a redirectUrl.
      const MANUAL_TEST_PREFIX = 'MANUAL_TEST:';
      if (rawUrl.startsWith(MANUAL_TEST_PREFIX)) {
        const testPageUrl = rawUrl.slice(MANUAL_TEST_PREFIX.length);
        return success({ redirectUrl: testPageUrl });
      }

      return success({ redirectUrl: rawUrl });
    } catch (err: any) {
      return failure(err);
    }
  }

  async checkStatus(invoiceId: string): Promise<Result<any>> {
    try {
      const response = await this._graphqlFetch<{ paymentStatus: any }>(
        `mutation PaymentStatus($invoiceId: ID!) {
          paymentStatus(invoiceId: $invoiceId) {
            id
            paymentStatus
            paymentMethod
            paidAt
          }
        }`,
        { invoiceId }
      );
      return success(response?.paymentStatus);
    } catch (err: any) {
      return failure(err);
    }
  }

  // Sends the user's manual test decision (SUCCESS or FAILURE) to the backend.
  // The backend applies the real invoice + booking state update (SUCCESS) or no-op (FAILURE).
  async manualTestPayment(invoiceId: string, result: 'SUCCESS' | 'FAILURE'): Promise<Result<any>> {
    try {
      const response = await this._graphqlFetch<{ manualTestPayment: any }>(
        `mutation ManualTestPayment($invoiceId: ID!, $result: String!) {
          manualTestPayment(invoiceId: $invoiceId, result: $result) {
            id
            paymentStatus
            paymentMethod
            paidAt
            bookingId
          }
        }`,
        { invoiceId, result }
      );
      return success(response?.manualTestPayment);
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
        // PG redirect flow (PhonePe) or Manual Test page — backend handles state on result.
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

  // Delegates to the provider's manualTestPayment — only valid in manual_test mode.
  async manualTestPayment(invoiceId: string, result: 'SUCCESS' | 'FAILURE'): Promise<Result<any>> {
    if (this.provider instanceof ApiPaymentProvider) {
      return this.provider.manualTestPayment(invoiceId, result);
    }
    return failure(new Error('manualTestPayment not supported in mock provider'));
  }
}
