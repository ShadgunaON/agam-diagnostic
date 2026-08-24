"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/common';
import { bookingService, invoiceService, reviewService } from '@/services';
import { BookingModel } from '@/domains/booking/model';
import { InvoiceModel } from '@/domains/invoice/model';
import { ReviewModel } from '@/domains/review/model';
import { CollectionTaskModel } from '@/domains/collections/model';
import { ReportTaskModel } from '@/domains/reports/model';
import { collectionService, reportsService } from '@/services';

export default function BookingsPage() {
  const { isAuthenticated, user } = useAuth();

  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [invoices, setInvoices] = useState<Record<string, InvoiceModel>>({});
  const [reviews, setReviews] = useState<Record<string, ReviewModel>>({});
  const [collections, setCollections] = useState<Record<string, CollectionTaskModel>>({});
  const [reports, setReports] = useState<Record<string, ReportTaskModel>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<'none' | '401' | '403' | '500'>('none');

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchData = async () => {
      try {
        const result = await bookingService.getAll();
        if (result.isSuccess) {
          // Filter bookings that belong to user or their family
          const familyIds = user.savedPatients.map(p => p.id);
          const validIds = [user.id, ...familyIds];

          const normalizePhone = (phone?: string) => phone ? phone.replace(/\D/g, '').slice(-10) : '';
          const userPhoneNormalized = normalizePhone(user.mobile);

          const userBookings = result.value.filter(b => {
            if (b.patientId && validIds.includes(b.patientId)) return true;
            return normalizePhone(b.patient?.phone) === userPhoneNormalized;
          });

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

          // Fetch reviews for these bookings
          const reviewsResult = await reviewService.getReviewsByPatient(user.id);
          if (reviewsResult.isSuccess) {
            const reviewMap: Record<string, ReviewModel> = {};
            reviewsResult.value.forEach(rev => {
              reviewMap[rev.bookingId] = rev;
            });
            // Also check for family members' reviews if necessary
            const allReviewsResult = await reviewService.getAllReviews();
            if (allReviewsResult.isSuccess) {
              allReviewsResult.value.forEach(rev => {
                if (userBookings.some(b => b.id === rev.bookingId)) {
                  reviewMap[rev.bookingId] = rev;
                }
              });
            }
            setReviews(reviewMap);
          }

          const collectionsResult = await collectionService.getAll();
          if (collectionsResult.isSuccess) {
            const collectionMap: Record<string, CollectionTaskModel> = {};
            collectionsResult.value.forEach(col => {
              if (col.bookingId) collectionMap[col.bookingId] = col;
            });
            setCollections(collectionMap);
          }

          const reportsResult = await reportsService.getAllTasks();
          if (reportsResult.isSuccess) {
            const reportMap: Record<string, ReportTaskModel> = {};
            reportsResult.value.forEach(rep => {
              if (rep.bookingId) reportMap[rep.bookingId] = rep;
            });
            setReports(reportMap);
          }
        } else {
          const status = (result.error as any)?.status;
          if (status === 401 || result.error?.message?.includes('401')) {
            setErrorState('401');
          } else if (status === 403 || result.error?.message?.includes('403') || result.error?.message?.includes('Forbidden')) {
            setErrorState('403');
          } else {
            setErrorState('500');
          }
        }
      } catch (error) {
        console.error("Failed to load bookings", error);
        setErrorState('500');
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
          <p className="text-muted-foreground text-sm mt-1">Manage and track your diagnostic tests</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground animate-pulse font-medium">Loading bookings...</p>
          </div>
        ) : errorState === '401' ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <p className="text-muted-foreground font-medium">Your session has expired. Please sign in again.</p>
            <Button variant="outline" onClick={() => window.location.href = '/login'}>Sign In</Button>
          </div>
        ) : errorState === '403' ? (
          <div className="flex justify-center items-center h-64 text-center">
            <p className="text-muted-foreground font-medium">You do not have permission to view these bookings.</p>
          </div>
        ) : errorState === '500' ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4 text-center">
            <p className="text-muted-foreground font-medium">Unable to load bookings. Please try again.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-bg-alt rounded-2xl border border-border/50 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">No bookings found.</h3>
            <p className="text-muted-foreground mb-6 max-w-md">You haven't booked any diagnostic tests yet. When you do, they will appear here for easy tracking.</p>
            <Link href="/book">
              <Button variant="primary">Book a Test Now</Button>
            </Link>
          </div>
        ) : (
          /* Bookings List */
          <div className="space-y-4">
            {bookings.map((booking) => {
              const invoice = invoices[booking.id];
              const review = reviews[booking.id];
              const collection = collections[booking.id];
              const report = reports[booking.id];

              const isHome = booking.collection.type === 'Home Collection';
              const steps = isHome ? [
                { label: 'Confirmed', completed: true },
                { label: 'Assigned', completed: collection?.assignedTo && collection.assignedTo !== 'Unassigned' },
                { label: 'On the Way', completed: ['En Route', 'Sample Collected', 'Completed'].includes(collection?.status || '') },
                { label: 'Sample Collected', completed: ['Sample Collected', 'Completed'].includes(collection?.status || '') },
                { label: 'Payment', completed: invoice?.paymentStatus === 'Paid' },
                { label: 'Processing', completed: ['Processing', 'Generated', 'Awaiting Verification', 'Published'].includes(report?.status || '') },
                { label: 'Report Ready', completed: report?.status === 'Published' },
                { label: 'Completed', completed: booking.status === 'Completed' }
              ] : [
                { label: 'Confirmed', completed: true },
                { label: 'Check-In', completed: ['Checked In', 'Sample Collected', 'Completed'].includes(collection?.status || '') },
                { label: 'Sample Collected', completed: ['Sample Collected', 'Completed'].includes(collection?.status || '') },
                { label: 'Payment', completed: invoice?.paymentStatus === 'Paid' },
                { label: 'Processing', completed: ['Processing', 'Generated', 'Awaiting Verification', 'Published'].includes(report?.status || '') },
                { label: 'Report Ready', completed: report?.status === 'Published' },
                { label: 'Completed', completed: booking.status === 'Completed' }
              ];

              return (
                <div key={booking.id} className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow gap-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                        Patient: <strong className="text-foreground">{booking.patient.name}</strong>
                        {booking.patientId && booking.patientId !== user?.id && (
                          <span className="ml-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">Family Member</span>
                        )}
                        <span className="mx-2">•</span>
                        {booking.collection.date} | {booking.collection.timeSlot}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.collection.type} • {booking.collection.address}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[140px]">
                      {invoice?.paymentStatus === 'Pending' && (
                        <span className="w-full text-center py-2 px-4 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
                          Payment Due
                        </span>
                      )}
                      {invoice?.paymentStatus === 'Paid' && (
                        <Link href={`/bookings/${booking.id}/receipt`} className="w-full text-center py-2 px-4 bg-white border border-border text-foreground text-sm font-bold rounded-full hover:bg-bg-alt transition-colors">
                          View Receipt
                        </Link>
                      )}
                      {booking.status === 'Completed' && (
                        <>
                          {!review ? (
                            <Link href={`/reviews/new/${booking.id}`} className="w-full text-center py-2 px-4 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold rounded-full hover:bg-blue-100 transition-colors">
                              Write a Review
                            </Link>
                          ) : (
                            <span className={`w-full text-center py-2 px-4 border text-sm font-bold rounded-full ${review.status === 'Approved' ? 'bg-green-50 border-green-200 text-green-700' :
                                review.status === 'Pending' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                  'bg-red-50 border-red-200 text-red-700'
                              }`}>
                              Review {review.status}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress Tracker */}
                  <div className="w-full mt-2 pt-4 border-t border-slate-100 overflow-x-auto hide-scrollbar">
                    <div className="flex items-start justify-between w-full pb-2 relative min-w-[600px]">
                      {steps.map((step, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center relative">
                          {/* Connecting Line */}
                          {idx !== steps.length - 1 && (
                            <div
                              className={`absolute top-2 left-[50%] w-full h-[3px] ${steps[idx + 1].completed ? 'bg-primary' : 'bg-slate-200'}`}
                              style={{ zIndex: 0 }}
                            ></div>
                          )}
                          {/* Node */}
                          <div
                            className={`w-4 h-4 rounded-full mb-2 relative flex items-center justify-center shrink-0 ${step.completed ? 'bg-primary shadow-[0_0_0_3px_rgba(239,246,255,1)]' : 'bg-slate-200'}`}
                            style={{ zIndex: 1 }}
                          >
                            {step.completed && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                          </div>
                          {/* Label */}
                          <span className={`text-[11px] leading-tight text-center font-bold px-1 w-[80px] ${step.completed ? 'text-primary' : 'text-slate-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
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
