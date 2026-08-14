'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { bookingService, invoiceService } from '@/services';
import { BookingModel } from '@/domains/booking/model';
import { InvoiceModel } from '@/domains/invoice/model';
import { Container } from '@/components/ui';

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [booking, setBooking] = useState<BookingModel | null>(null);
  const [invoice, setInvoice] = useState<InvoiceModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchBooking = async () => {
      try {
        const result = await bookingService.getById(id);
        if (result.isSuccess) {
          setBooking(result.value);
          
          const invResult = await invoiceService.getAll();
          if (invResult.isSuccess) {
            const foundInv = invResult.value.find(i => i.bookingId === result.value.id);
            if (foundInv) setInvoice(foundInv);
          }
        } else {
          setBooking(null);
        }
      } catch (error) {
        setBooking(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBooking();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Loading booking details...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '24px', color: 'var(--color-dark)', marginBottom: '16px' }}>Booking Not Found</h2>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '24px' }}>We couldn't find a booking with ID {id}.</p>
          <button 
            onClick={() => router.push('/book')}
            style={{ padding: '12px 24px', background: 'var(--color-primary)', color: '#fff', borderRadius: '100px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
          >
            Start New Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 80px)', padding: '40px 0' }}>
      <Container style={{ maxWidth: '900px' }}>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-stretch">
          
          {/* LEFT: STATUS & ACTIONS CARD */}
          <div className="flex-1 bg-white border border-slate-200/60 rounded-[20px] w-full max-w-[420px] mx-auto p-7 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] relative overflow-hidden flex flex-col justify-center items-center text-center">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500/90"></div>
            
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(16,185,129,0.2)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" style={{ width: '28px' }}><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            
            <h1 style={{ fontSize: '24px', color: 'var(--color-dark)', margin: '0 0 8px 0', fontWeight: 800 }}>Booking Confirmed!</h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-light)', marginBottom: '24px', lineHeight: 1.5 }}>
              Thank you, {booking.patient.name}. Your appointment is scheduled.
            </p>
            
            <div style={{ display: 'inline-block', background: '#f1f5f9', padding: '10px 20px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginBottom: '32px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Booking ID</span>
              <span style={{ fontSize: '18px', color: 'var(--color-primary)', fontWeight: 800 }}>{booking.id}</span>
            </div>
            
            <div className="flex flex-col gap-2.5 w-full mt-auto max-w-[280px]">
              {invoice && invoice.paymentStatus === 'Paid' && (
                 <div className="text-emerald-700 font-bold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 flex justify-center items-center gap-2 text-[13px] mb-1.5 shadow-sm">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                   Payment Successful
                 </div>
              )}
              {invoice && invoice.paymentStatus === 'Paid' && (
                <Link 
                  href={`/bookings/${booking.id}/receipt`}
                  className="w-full py-2.5 border border-primary text-primary hover:bg-slate-50 rounded-xl font-bold transition-colors text-sm"
                >
                  View Receipt
                </Link>
              )}
              <Link 
                href="/bookings"
                className="w-full py-2.5 bg-primary text-white hover:bg-primary-dark rounded-xl font-bold transition-colors text-sm shadow-sm"
              >
                View My Bookings
              </Link>
              
              <Link 
                href="/"
                className="w-full py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition-colors text-sm"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {/* RIGHT: APPOINTMENT SUMMARY CARD */}
          <div className="flex-1 bg-white border border-slate-200/60 rounded-[20px] w-full max-w-[420px] mx-auto p-7 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary/90"></div>
            
            <h3 style={{ fontSize: '18px', color: 'var(--color-dark)', marginTop: 0, marginBottom: '24px', fontWeight: 800 }}>Appointment Summary</h3>
            
            <div className="flex flex-col gap-5">
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Patient</div>
                <div style={{ fontSize: '15px', color: 'var(--color-dark)', fontWeight: 800 }}>{booking.patient.name} <span className="text-slate-500 font-semibold text-[13px] ml-1">({booking.patient.age}y, {booking.patient.gender})</span></div>
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Date & Time</div>
                <div style={{ fontSize: '15px', color: 'var(--color-dark)', fontWeight: 800 }}>{booking.collection.date} <span className="text-slate-400 font-normal mx-1">at</span> {booking.collection.timeSlot}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Location <span className="normal-case font-semibold text-primary ml-1 bg-blue-50 px-1.5 py-0.5 rounded">{booking.collection.type}</span></div>
                <div style={{ fontSize: '14px', color: 'var(--color-dark)', fontWeight: 700, lineHeight: 1.5 }}>{booking.collection.address}</div>
              </div>
              
              <div className="pt-5 mt-2 border-t border-slate-200/80">
                <div style={{ fontSize: '12px', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Tests & Packages</div>
                <div className="flex flex-col gap-2.5">
                  {booking.items.map((i, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></div>
                      <span style={{ fontSize: '14px', color: 'var(--color-dark)', fontWeight: 700, lineHeight: 1.3 }}>{i.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </Container>
    </div>
  );
}
