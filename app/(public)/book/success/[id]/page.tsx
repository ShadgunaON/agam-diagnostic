'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { bookingService } from '@/services';
import { BookingModel } from '@/domains/booking/model';
import { Container } from '@/components/ui';

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [booking, setBooking] = useState<BookingModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchBooking = async () => {
      try {
        const result = await bookingService.getById(id);
        if (result.isSuccess) {
          setBooking(result.value);
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
      <Container style={{ maxWidth: '700px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '48px', textAlign: 'center', boxShadow: '0 8px 32px rgba(11,27,61,0.06)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 16px rgba(16,185,129,0.2)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" style={{ width: '40px' }}><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          
          <h1 style={{ fontSize: '32px', color: 'var(--color-dark)', margin: '0 0 8px 0' }}>Booking Confirmed!</h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-light)', marginBottom: '32px' }}>
            Thank you, {booking.patient.name}. Your appointment has been scheduled successfully.
          </p>
          
          <div style={{ display: 'inline-block', background: '#f1f5f9', padding: '12px 24px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginBottom: '40px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Booking ID</span>
            <span style={{ fontSize: '24px', color: 'var(--color-primary)', fontWeight: 800 }}>{booking.id}</span>
          </div>
          
          <div style={{ textAlign: 'left', background: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--color-dark)', marginTop: 0, marginBottom: '20px' }}>Appointment Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-3">
                <span style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>Patient:</span>
                <span style={{ color: 'var(--color-dark)', fontWeight: 600 }}>{booking.patient.name} ({booking.patient.age}y, {booking.patient.gender})</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-3">
                <span style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>Date & Time:</span>
                <span style={{ color: 'var(--color-dark)', fontWeight: 600 }}>{booking.collection.date} | {booking.collection.timeSlot}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-3">
                <span style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>Location:</span>
                <span style={{ color: 'var(--color-dark)', fontWeight: 600 }}>{booking.collection.type} - {booking.collection.address}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-3">
                <span style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>Tests/Packages:</span>
                <span style={{ color: 'var(--color-dark)', fontWeight: 600 }}>{booking.items.map(i => i.name).join(', ')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/bookings"
              style={{ display: 'inline-block', padding: '16px 32px', background: 'var(--color-dark)', color: '#fff', borderRadius: '100px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(11,27,61,0.1)' }}
            >
              View My Bookings
            </Link>
            
            <Link 
              href="/"
              style={{ display: 'inline-block', padding: '16px 32px', background: '#fff', color: 'var(--color-text)', border: '1px solid #cbd5e1', borderRadius: '100px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
            >
              Back to Home
            </Link>
          </div>
          
        </div>
      </Container>
    </div>
  );
}
