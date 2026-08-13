"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { invoiceService, bookingService } from '@/services';
import { InvoiceModel } from '@/domains/invoice/model';
import { BookingModel } from '@/domains/booking/model';
import { Container, Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  
  const [invoice, setInvoice] = useState<InvoiceModel | null>(null);
  const [booking, setBooking] = useState<BookingModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!bookingId || authLoading) return;
    
    // In a real app we'd verify auth here, but for demo we proceed if we can fetch
    
    const fetchData = async () => {
      try {
        const bkResult = await bookingService.getById(bookingId);
        if (bkResult.isSuccess && bkResult.value) {
          setBooking(bkResult.value);
          
          // Fetch invoice by bookingId
          const invResult = await invoiceService.getAll();
          if (invResult.isSuccess) {
            const foundInv = invResult.value.find(i => i.bookingId === bookingId);
            if (foundInv) {
              setInvoice(foundInv);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load receipt details", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [bookingId, authLoading]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || authLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-primary font-bold">Loading receipt...</div>;
  }

  if (!invoice || !booking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-bg-alt">
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center">
          <h2 className="text-xl font-bold text-foreground mb-4">Receipt Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested receipt could not be found for this booking.</p>
          <Button href="/bookings" variant="primary">Return to Bookings</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-alt py-12 min-h-[calc(100vh-80px)] font-sans">
      <Container className="max-w-2xl">
        {/* Actions Bar (Hidden on Print) */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Button href="/bookings" variant="outline" size="sm">
            &larr; Back to Bookings
          </Button>
          {invoice.paymentStatus === 'Pending' ? (
            <Button href={`/payment/${invoice.id}`} variant="primary" size="sm">
              Pay Now
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2 inline-block"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print Receipt
            </Button>
          )}
        </div>

        {/* Receipt Paper */}
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-border print:shadow-none print:border-none print:p-0">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-border/50 pb-6 mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-black text-primary tracking-tight">AGAM DIAGNOSTICS</h1>
              <p className="text-xs text-muted-foreground mt-1">Plot No 12, Anna Nagar Main Road,<br/>Madurai, Tamil Nadu - 625020</p>
              <p className="text-xs text-muted-foreground mt-1">Ph: +91 89408 94079</p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <h2 className="text-2xl sm:text-3xl font-light text-slate-300 uppercase tracking-widest">
                {invoice.paymentStatus === 'Paid' ? 'Receipt' : 'Invoice'}
              </h2>
              <p className="text-sm font-bold text-foreground mt-2 break-all">#{invoice.id}</p>
              <p className="text-xs text-muted-foreground">Date: {invoice.createdAt}</p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To</p>
              <p className="font-bold text-foreground">{booking.patient.name}</p>
              <p className="text-sm text-muted-foreground">{booking.patient.age} yrs, {booking.patient.gender}</p>
              <p className="text-sm text-muted-foreground break-all">{booking.patient.phone || booking.patient.email}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Appointment Info</p>
              <p className="font-bold text-foreground break-all">Booking #{booking.id}</p>
              <p className="text-sm text-muted-foreground">{booking.collection.type}</p>
              <p className="text-sm text-muted-foreground">{booking.collection.date} | {booking.collection.timeSlot}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-4 text-sm font-medium text-foreground">{item.name}</td>
                    <td className="py-4 text-sm font-bold text-foreground text-right">₹{item.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8 border-t border-slate-100 pt-4">
            <div className="w-64">
              <div className="flex justify-between py-1">
                <span className="text-sm text-muted-foreground">Subtotal:</span>
                <span className="text-sm font-semibold">₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 pb-3 mb-3">
                <span className="text-sm text-muted-foreground">Discount:</span>
                <span className="text-sm font-semibold text-green-600">-₹{invoice.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-foreground">Total:</span>
                <span className="text-2xl font-black text-primary">₹{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status Box */}
          <div className={`p-4 rounded-lg flex items-center justify-between ${invoice.paymentStatus === 'Paid' ? 'bg-green-50 border border-green-100' : 'bg-orange-50 border border-orange-100'}`}>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">Payment Status</p>
              <div className="flex items-center gap-2">
                <span className={`font-black text-lg ${invoice.paymentStatus === 'Paid' ? 'text-green-700' : 'text-orange-700'}`}>
                  {invoice.paymentStatus}
                </span>
                {invoice.paymentStatus === 'Paid' && invoice.paymentMethod && (
                  <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded">via {invoice.paymentMethod}</span>
                )}
              </div>
              {invoice.paymentStatus === 'Paid' && invoice.paidAt && (
                <p className="text-xs text-green-600 mt-1">Received on {invoice.paidAt}</p>
              )}
            </div>
            {invoice.paymentStatus === 'Paid' && (
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" className="w-6 h-6"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            )}
          </div>

        </div>
      </Container>
    </div>
  );
}
