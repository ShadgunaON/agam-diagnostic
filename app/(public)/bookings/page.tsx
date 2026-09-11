"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/common';
import { BookingModel } from '@/domains/booking/model';
import { InvoiceModel } from '@/domains/invoice/model';
import { ReviewModel } from '@/domains/review/model';
import { CollectionTaskModel } from '@/domains/collections/model';
import { ReportTaskModel } from '@/domains/reports/model';

export default function BookingsPage() {
  const { isAuthenticated, user } = useAuth();

  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [invoices, setInvoices] = useState<Record<string, InvoiceModel>>({});
  const [reviews, setReviews] = useState<Record<string, ReviewModel>>({});
  const [collections, setCollections] = useState<Record<string, CollectionTaskModel>>({});
  const [reports, setReports] = useState<Record<string, ReportTaskModel>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<string>('none');

  useEffect(() => {
    if (!isAuthenticated || !user) return;

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = React.useCallback(async () => {
    if (!isAuthenticated || !user) return;
    setIsRefreshing(true);
      try {
        const query = `
          query MyPortal {
            myPortal {
              bookings {
                id
                status
                createdAt
                collection { type date timeSlot address }
                items { name type }
                patient { name }
              }
              invoices {
                id
                bookingId
                paymentStatus
                paymentMethod
              }
              reviews {
                id
                bookingId
                status
              }
              collections {
                id
                bookingId
                status
                assignedTo
              }
              reports {
                id
                bookingId
                status
              }
            }
          }
        `;

        const token = sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '';
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ query }),
          cache: 'no-store'
        });

        const json = await response.json();
        
        if (json.errors) {
          throw new Error(json.errors[0]?.message || 'GraphQL Error');
        }

        const data = json.data?.myPortal;
        if (data) {
          setBookings(data.bookings || []);

          const invoiceMap: Record<string, InvoiceModel> = {};
          (data.invoices || []).forEach((inv: any) => {
            if (inv.bookingId) invoiceMap[inv.bookingId] = inv;
          });
          setInvoices(invoiceMap);

          const reviewMap: Record<string, ReviewModel> = {};
          (data.reviews || []).forEach((rev: any) => {
            if (rev.bookingId) reviewMap[rev.bookingId] = rev;
          });
          setReviews(reviewMap);

          const collectionMap: Record<string, CollectionTaskModel> = {};
          (data.collections || []).forEach((col: any) => {
            if (col.bookingId) collectionMap[col.bookingId] = col;
          });
          setCollections(collectionMap);

          const reportMap: Record<string, ReportTaskModel> = {};
          (data.reports || []).forEach((rep: any) => {
            if (rep.bookingId) reportMap[rep.bookingId] = rep;
          });
          setReports(reportMap);
        }

      } catch (error: any) {
        console.error("Failed to load bookings portal data", error);
        const errMsg = error.message?.toLowerCase() || '';
        if (errMsg.includes('expired') || errMsg.includes('token')) {
          setErrorState('401');
        } else if (errMsg.includes('access denied') || errMsg.includes('unauthorized') || errMsg.includes('authoriz')) {
          setErrorState('403');
        } else {
          setErrorState(error.message || '500');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AuthGuard>
      <div className="container" style={{ paddingTop: 'var(--sp-10)', paddingBottom: 'var(--sp-10)' }}>
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-1">My Bookings</h1>
            <p className="text-sm text-muted-foreground">
              {isAuthenticated
                ? `Welcome back, ${user?.fullName || 'Patient'}. Your appointment history will appear here.`
                : 'Log in to view and manage your booking history.'}
            </p>
            <p className="text-muted-foreground text-sm mt-1">Manage and track your diagnostic tests</p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchData} 
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 self-start md:self-auto"
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <path d="M21.5 2v6h-6M2.13 15.57a10 10 0 1 0 3.43-12.2l-4.14 4.14" />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
          </Button>
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
        ) : errorState !== 'none' ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4 text-center">
            <p className="text-red-500 font-medium">Unable to load bookings: {errorState}</p>
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

              const isHome = booking.collection?.type === 'Home Collection';
              const isPaid = invoice?.paymentStatus === 'Paid';
              const isCOD = invoice?.paymentStatus === 'Pending';
              
              const isAssigned = collection?.assignedTo && collection.assignedTo !== 'Unassigned';
              const isCheckedIn = ['Checked In', 'Sample Collected', 'Completed'].includes(collection?.status || '');
              const isEnRoute = ['En Route', 'Sample Collected', 'Completed'].includes(collection?.status || '');
              const isSampleCollected = ['Sample Collected', 'Completed'].includes(collection?.status || '');
              const isProcessing = ['Processing', 'Generated', 'Awaiting Verification', 'Published'].includes(report?.status || '');
              const isReportReady = report?.status === 'Published';
              const isCompleted = booking.status === 'Completed';

              // Enforce chronological visual invariants: a step is completed only if it is completed AND its logical predecessor is completed.
              const stepAssigned = isHome ? isAssigned : isCheckedIn;
              const stepEnRoute = isHome ? (isAssigned && isEnRoute) : false;
              const stepSampleCollected = isHome ? (stepEnRoute && isSampleCollected) : (stepAssigned && isSampleCollected);
              
              const isLatePayment = invoice?.paymentMethod === 'Cash' || invoice?.paymentMethod === 'COD';
              const paymentNodeLabel = isLatePayment ? 'Payment Collected' : 'Payment';

              const steps = isHome ? [
                { label: 'Confirmed', completed: true },
                ...(isLatePayment ? [] : [{ label: paymentNodeLabel, completed: isPaid }]),
                { label: 'Assigned', completed: stepAssigned },
                { label: 'On the Way', completed: stepEnRoute },
                { label: 'Sample Collected', completed: stepSampleCollected },
                ...(isLatePayment ? [{ label: paymentNodeLabel, completed: isPaid }] : []),
                { label: 'Processing', completed: isProcessing },
                { label: 'Report Ready', completed: isReportReady },
                { label: 'Completed', completed: isCompleted }
              ] : [
                { label: 'Confirmed', completed: true },
                ...(isLatePayment ? [] : [{ label: paymentNodeLabel, completed: isPaid }]),
                { label: 'Check-In', completed: stepAssigned },
                { label: 'Sample Collected', completed: stepSampleCollected },
                ...(isLatePayment ? [{ label: paymentNodeLabel, completed: isPaid }] : []),
                { label: 'Processing', completed: isProcessing },
                { label: 'Report Ready', completed: isReportReady },
                { label: 'Completed', completed: isCompleted }
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
                        {booking.collection?.date} | {booking.collection?.timeSlot}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.collection?.type} • {booking.collection?.address}
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
                      {/* Review Section */}
                      {(booking.status === 'Completed' || review) && (
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                          {!review ? (
                            <Link href={`/reviews/new/${booking.id}`} className="w-full text-center py-2 px-4 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold rounded-full hover:bg-blue-100 transition-colors">
                              Write a Review
                            </Link>
                          ) : (
                            <span className={`w-full text-center py-2 px-4 border text-sm font-bold rounded-full ${review.status === 'Approved' ? 'bg-green-50 border-green-200 text-green-700' :
                                review.status === 'Pending' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                  'bg-slate-50 border-slate-200 text-slate-700'
                              }`}>
                              Review {review.status}
                            </span>
                          )}
                        </div>
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
