"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { invoiceService, paymentService, bookingService } from '@/services';
import { InvoiceModel } from '@/domains/invoice/model';
import { BookingModel } from '@/domains/booking/model';
import { Container, Card, Button } from '@/components/ui';

export default function DemoPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId as string;
  
  const [invoice, setInvoice] = useState<InvoiceModel | null>(null);
  const [booking, setBooking] = useState<BookingModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  useEffect(() => {
    if (!invoiceId) return;
    
    const fetchData = async () => {
      try {
        const invResult = await invoiceService.getById(invoiceId);
        if (invResult.isSuccess && invResult.value) {
          setInvoice(invResult.value);
          
          if (invResult.value.bookingId) {
            const bkResult = await bookingService.getById(invResult.value.bookingId);
            if (bkResult.isSuccess) {
              setBooking(bkResult.value);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load invoice details", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [invoiceId]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    
    try {
      if (paymentMethod === 'Cash') {
        // Offline payment selected
        const result = await invoiceService.setPaymentMethod(invoiceId, 'Cash');
        if (result.isSuccess) {
          router.push(`/book/success/${invoice?.bookingId}`);
        } else {
          setErrorMsg(result.error?.message || 'Failed to select payment method.');
          setIsProcessing(false);
        }
      } else {
        // Online payment selected
        const result = await paymentService.processOnlinePayment(invoiceId, invoice?.total || 0, paymentMethod, true);
        
        if (result.isSuccess) {
          if ('redirectUrl' in result.value && result.value.redirectUrl) {
            // PG integration (PhonePe) -> Redirect browser
            window.location.href = result.value.redirectUrl;
          } else {
            // Fallback mock logic if env.useMockData is still active
            router.push(`/book/success/${invoice?.bookingId}`);
          }
        } else {
          setErrorMsg(result.error?.message || 'Payment initialization failed. Please try again.');
          setIsProcessing(false);
        }
      }
    } catch (e) {
      setErrorMsg('An unexpected error occurred during processing.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-primary font-bold">Loading payment details...</div>;
  }

  if (!invoice || !booking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-bg-alt">
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center">
          <h2 className="text-xl font-bold text-foreground mb-4">Payment Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested payment session could not be found or has expired.</p>
          <Button href="/bookings" variant="primary">Return to Bookings</Button>
        </div>
      </div>
    );
  }

  if (invoice.paymentStatus === 'Paid') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-bg-alt">
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Payment Already Completed</h2>
          <p className="text-muted-foreground mb-6">This invoice was paid on {invoice.paidAt}.</p>
          <Button href={`/bookings/${invoice.bookingId}/receipt`} variant="primary">View Receipt</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-alt py-12 min-h-[calc(100vh-80px)]">
      <Container className="max-w-3xl">
        <div className="mb-6 text-center">
          <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-3 inline-block">Secure Checkout</span>
          <h1 className="text-3xl font-extrabold text-foreground">Complete Your Payment</h1>
          <p className="text-muted-foreground mt-2">Choose your preferred payment method to complete the booking.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <Card.Header className="border-b border-border/50 pb-3">
                <Card.Title className="text-lg">Order Summary</Card.Title>
              </Card.Header>
              <Card.Content className="pt-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Patient</p>
                  <p className="font-bold text-sm">{booking.patient.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Tests / Packages</p>
                  <div className="space-y-1 mt-1">
                    {invoice.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="font-medium text-foreground line-clamp-1 pr-2">{item.name}</span>
                        <span className="font-bold shrink-0">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <span className="font-bold text-foreground">Total Amount</span>
                  <span className="text-xl font-extrabold text-primary">₹{invoice.total}</span>
                </div>
              </Card.Content>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card>
              <Card.Header className="border-b border-border/50 pb-3">
                <Card.Title className="text-lg">Payment Details</Card.Title>
              </Card.Header>
              <Card.Content className="pt-4 space-y-6">
                
                {errorMsg && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    <label className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'UPI' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}>
                      <input type="radio" name="payment_method" className="sr-only" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="3" y="5" width="18" height="14" rx="2" ry="2"/><line x1="12" y1="12" x2="12" y2="12.01"/></svg>
                      </div>
                      <span className="font-bold text-sm text-center">UPI / QR</span>
                    </label>
                    <label className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'Credit Card' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}>
                      <input type="radio" name="payment_method" className="sr-only" checked={paymentMethod === 'Credit Card'} onChange={() => setPaymentMethod('Credit Card')} />
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                      </div>
                      <span className="font-bold text-sm text-center">Cards</span>
                    </label>
                    <label className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'Cash' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}>
                      <input type="radio" name="payment_method" className="sr-only" checked={paymentMethod === 'Cash'} onChange={() => setPaymentMethod('Cash')} />
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
                      </div>
                      <span className="font-bold text-sm text-center">
                        {booking.collection.type === 'Home Collection' ? 'Pay at Collection' : 'Pay at Lab'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex flex-col gap-2 mt-2">
                    <Button 
                      variant="primary" 
                      className="w-full justify-center text-lg py-6 shadow-md" 
                      onClick={handlePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : paymentMethod === 'Cash' ? 'Confirm Pay at Lab Booking' : `Pay ₹${invoice.total} Securely`}
                    </Button>
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Payments are 100% secure and encrypted.
                  </p>
                </div>
                
              </Card.Content>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
