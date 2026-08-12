"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/common';
import { bookingService, invoiceService } from '@/services';
import { BookingModel } from '@/domains/booking/model';
import { InvoiceModel } from '@/domains/invoice/model';

export default function BookingsPage() {
  const { isAuthenticated, user } = useAuth();
  
  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [invoices, setInvoices] = useState<Record<string, InvoiceModel>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const fetchData = async () => {
      try {
        const result = await bookingService.getAll();
        if (result.isSuccess) {
          // Filter bookings that belong to user or their family
          const familyIds = user.savedPatients.map(p => p.id);
          const validIds = [user.id, ...familyIds];
          
          const userBookings = result.value.filter(b => 
            (b.patientId && validIds.includes(b.patientId)) || b.patient.phone === user.mobile
          );
          
          // Sort by date descending
          userBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setBookings(userBookings);
          
          // Fetch invoices for these bookings
          const invoicesResult = await invoiceService.getAll();
          if (invoicesResult.isSuccess) {
            const invoiceMap: Record<string, InvoiceModel> = {};
            invoicesResult.value.forEach(inv => {
              if (inv.bookingId) {
                invoiceMap[inv.bookingId] = inv;
              }
            });
            setInvoices(invoiceMap);
          }
        }
      } catch (error) {
        console.error("Failed to load bookings", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, user]);

  return (
    <AuthGuard>
      <div className="container" style={{ paddingTop: 'var(--sp-10)', paddingBottom: 'var(--sp-10)' }}>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-1">My Bookings</h1>
          <p className="text-sm text-muted-foreground">
            {isAuthenticated
              ? `Welcome back, ${user?.fullName || 'Patient'}. Your appointment history will appear here.`
              : 'Log in to view and manage your booking history.'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-primary font-semibold">Loading your bookings...</div>
        ) : bookings.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-border rounded-2xl p-10 md:p-16 text-center shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-bg-alt rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-muted-foreground/50">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <line x1="8" y1="14" x2="10" y2="14"/>
                <line x1="14" y1="14" x2="16" y2="14"/>
                <line x1="8" y1="18" x2="10" y2="18"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No Bookings Yet</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
              Your booking history will appear here once you schedule a test or health package.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button href="/tests" className="btn btn--primary btn--sm text-sm font-bold px-6">
                Browse Tests
              </Button>
            </div>
          </div>
        ) : (
          /* Bookings List */
          <div className="space-y-4">
            {bookings.map((booking) => {
              const invoice = invoices[booking.id];
              return (
                <div key={booking.id} className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold bg-bg-alt text-muted-foreground px-2 py-1 rounded-md tracking-wider uppercase">{booking.id}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md tracking-wider uppercase ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {booking.status}
                      </span>
                      {invoice && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-md tracking-wider uppercase ${invoice.paymentStatus === 'Paid' ? 'bg-primary/10 text-primary' : 'bg-yellow-100 text-yellow-700'}`}>
                          {invoice.paymentStatus}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-1">{booking.items.map(i => i.name).join(', ')}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Patient: <strong className="text-foreground">{booking.patient.name}</strong> • {booking.collection.date} | {booking.collection.timeSlot}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.collection.type} • {booking.collection.address}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    {invoice?.paymentStatus === 'Pending' && (
                      <Link href={`/payment/${invoice.id}`} className="w-full text-center py-2 px-4 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 transition-colors">
                        Pay Now
                      </Link>
                    )}
                    {invoice?.paymentStatus === 'Paid' && (
                      <Link href={`/bookings/${booking.id}/receipt`} className="w-full text-center py-2 px-4 bg-white border border-border text-foreground text-sm font-bold rounded-full hover:bg-bg-alt transition-colors">
                        View Receipt
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
