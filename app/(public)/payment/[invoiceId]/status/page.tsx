"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { paymentService, invoiceService } from '@/services';
import { Container, Card, Button } from '@/components/ui';

export default function PaymentStatusPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = params.invoiceId as string;

  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'FAILED' | 'PENDING'>('LOADING');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!invoiceId) return;

    let timeoutId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const result = await paymentService.checkStatus(invoiceId);
        
        if (result.isSuccess && result.value) {
          if (result.value.paymentStatus === 'Paid') {
            setStatus('SUCCESS');
            return;
          }
          
          // Check if PhonePe appended 'code' indicating explicit failure
          const phonepeCode = searchParams.get('code');
          if (phonepeCode && phonepeCode !== 'PAYMENT_SUCCESS' && phonepeCode !== 'PAYMENT_PENDING') {
            setStatus('FAILED');
            return;
          }
          
          // If still pending, and we haven't checked too many times, retry after delay
          if (attempts < 10) {
            timeoutId = setTimeout(() => {
              setAttempts(prev => prev + 1);
            }, 3000); // Check every 3 seconds up to 30 seconds
          } else {
            // Timeout reached, might still be processing
            setStatus('PENDING');
          }
        } else {
          setStatus('FAILED');
        }
      } catch (err) {
        if (attempts < 5) {
           timeoutId = setTimeout(() => {
              setAttempts(prev => prev + 1);
           }, 3000);
        } else {
           setStatus('FAILED');
        }
      }
    };

    checkStatus();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [invoiceId, attempts, searchParams]);

  const handleContinue = async () => {
    if (status === 'SUCCESS') {
      const inv = await invoiceService.getById(invoiceId);
      if (inv.isSuccess && inv.value?.bookingId) {
        router.push(`/book/success/${inv.value.bookingId}`);
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push(`/payment/${invoiceId}`); // Try again
    }
  };

  return (
    <div className="bg-bg-alt py-12 min-h-[calc(100vh-80px)] flex items-center justify-center">
      <Container className="max-w-md">
        <Card className="text-center p-8">
          {status === 'LOADING' && (
             <div className="space-y-4 py-8">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h2 className="text-xl font-bold">Verifying Payment...</h2>
                <p className="text-muted-foreground text-sm">Please do not refresh the page.</p>
             </div>
          )}

          {status === 'SUCCESS' && (
            <div className="space-y-4 py-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
              <p className="text-muted-foreground">Your transaction has been securely processed.</p>
              <div className="pt-6">
                 <Button variant="primary" className="w-full justify-center" onClick={handleContinue}>View Receipt</Button>
              </div>
            </div>
          )}

          {status === 'FAILED' && (
            <div className="space-y-4 py-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Payment Failed</h2>
              <p className="text-muted-foreground">We could not complete your transaction. No charges were made.</p>
              <div className="pt-6">
                 <Button variant="primary" className="w-full justify-center" onClick={handleContinue}>Try Again</Button>
              </div>
            </div>
          )}

          {status === 'PENDING' && (
            <div className="space-y-4 py-4">
              <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Processing Payment</h2>
              <p className="text-muted-foreground">We are waiting for confirmation from your bank. This may take a few minutes. We will update your dashboard once confirmed.</p>
              <div className="pt-6">
                 <Button variant="outline" className="w-full justify-center" onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
              </div>
            </div>
          )}
        </Card>
      </Container>
    </div>
  );
}
