"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/common';
import { bookingService } from '@/services';
import { BookingModel } from '@/domains/booking/model';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<'none' | 'error'>('none');

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Only fetch data scoped to the currently authenticated patient's ID
        // Note: We use getByPatientId to avoid fetching the entire database and filtering on the frontend.
        const bookingsResult = await bookingService.getByPatientId(user.id);
        
        if (bookingsResult.isSuccess) {
          const sortedBookings = bookingsResult.value.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setBookings(sortedBookings);
        } else {
          setErrorState('error');
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        setErrorState('error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Determine the upcoming booking (latest booking that is not 'Completed' or 'Cancelled')
  const upcomingBooking = bookings.find(b => b.status !== 'Completed' && b.status !== 'Cancelled');
  
  // Recent bookings (up to 3)
  const recentBookings = bookings.slice(0, 3);

  return (
    <AuthGuard>
      <div className="container" style={{ paddingTop: 'var(--sp-10)', paddingBottom: 'var(--sp-10)' }}>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-1">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.fullName || 'Patient'}. Here is an overview of your health journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Upcoming Booking Section */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-dark">Upcoming Appointment</h2>
              
              {isLoading ? (
                <div className="h-40 rounded-2xl border border-border/50 bg-slate-50 animate-pulse"></div>
              ) : errorState === 'error' ? (
                <div className="p-6 rounded-2xl border border-red-100 bg-red-50 text-red-600 text-sm">
                  Unable to load upcoming appointments at this time.
                </div>
              ) : upcomingBooking ? (
                <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold bg-bg-alt text-muted-foreground px-2 py-1 rounded-md tracking-wider uppercase">{upcomingBooking.id}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md tracking-wider uppercase bg-orange-100 text-orange-700`}>
                          {upcomingBooking.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-1">{upcomingBooking.items.map(i => i.name).join(', ')}</h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        Patient: <strong className="text-foreground">{upcomingBooking.patient.name}</strong>
                      </p>
                      <p className="text-sm text-foreground font-semibold">
                        {upcomingBooking.collection.date} | {upcomingBooking.collection.timeSlot}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {upcomingBooking.collection.type} • {upcomingBooking.collection.address}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <Link href="/bookings">
                      <Button variant="outline" className="w-full">View Details</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-bg-alt rounded-2xl border border-border/50 p-8 text-center flex flex-col items-center justify-center">
                  <p className="text-muted-foreground mb-4">You have no upcoming appointments.</p>
                  <Link href="/tests">
                    <Button variant="primary">Book a Test</Button>
                  </Link>
                </div>
              )}
            </section>

            {/* Recent Bookings Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-dark">Recent Bookings</h2>
                <Link href="/bookings" className="text-sm font-bold text-primary hover:underline">View All</Link>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-24 rounded-2xl border border-border/50 bg-slate-50 animate-pulse"></div>
                  <div className="h-24 rounded-2xl border border-border/50 bg-slate-50 animate-pulse"></div>
                </div>
              ) : errorState === 'error' ? (
                <div className="p-6 rounded-2xl border border-red-100 bg-red-50 text-red-600 text-sm">
                  Unable to load recent bookings.
                </div>
              ) : recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map(booking => (
                    <div key={booking.id} className="bg-white border border-border rounded-xl p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
                      <div>
                        <h4 className="font-bold text-sm mb-1">{booking.items[0]?.name} {booking.items.length > 1 ? `+${booking.items.length - 1} more` : ''}</h4>
                        <p className="text-xs text-muted-foreground">{booking.collection.date} • {booking.status}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${booking.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-bg-alt text-muted-foreground'}`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-border rounded-xl p-6 text-center">
                  <p className="text-sm text-muted-foreground">No recent bookings found.</p>
                </div>
              )}
            </section>

          </div>

          {/* Sidebar / Quick Actions Area */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 text-dark">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/tests" className="bg-white border border-border rounded-xl p-4 text-center hover:border-primary hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 mx-auto bg-blue-50 text-primary rounded-full flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M9 12h6M12 9v6M19 12a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <span className="text-xs font-bold block text-foreground">Book Test</span>
                </Link>
                <Link href="/health-packages" className="bg-white border border-border rounded-xl p-4 text-center hover:border-primary hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 mx-auto bg-blue-50 text-primary rounded-full flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  </div>
                  <span className="text-xs font-bold block text-foreground">Packages</span>
                </Link>
                <Link href="/reports" className="bg-white border border-border rounded-xl p-4 text-center hover:border-primary hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 mx-auto bg-blue-50 text-primary rounded-full flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <span className="text-xs font-bold block text-foreground">My Reports</span>
                </Link>
                <Link href="/services" className="bg-white border border-border rounded-xl p-4 text-center hover:border-primary hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 mx-auto bg-blue-50 text-primary rounded-full flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  </div>
                  <span className="text-xs font-bold block text-foreground">Services</span>
                </Link>
              </div>
            </section>

            <section>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                <h3 className="font-bold text-primary mb-2">Need Support?</h3>
                <p className="text-sm text-muted-foreground mb-4">Our care team is available to assist you with your bookings or reports.</p>
                <Link href="/help">
                  <Button variant="outline" className="w-full border-primary/50 text-primary hover:bg-primary/10">Contact Support</Button>
                </Link>
              </div>
            </section>
          </div>

        </div>
      </div>
    </AuthGuard>
  );
}
