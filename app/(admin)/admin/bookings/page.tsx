'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { BookingsFilterBar } from '@/components/admin/bookings/BookingsFilterBar';
import { BookingsTable } from '@/components/admin/bookings/BookingsTable';
import { BookingDetailsDrawer } from '@/components/admin/bookings/BookingDetailsDrawer';
import { useBookingSelection } from '@/hooks/admin/useBookingSelection';
import { mockBookings, Booking, BookingStatus } from '@/data/admin/mockBookings';
import { KPICard } from '@/components/admin/layout/KPICard';
import { AdminCard } from '@/components/admin/primitives/AdminCard';
import { AdminDialog, DialogFooterCancel, DialogFooterConfirm } from '@/components/admin/overlays/AdminDialog';
import { useToast } from '@/components/admin/feedback/Toast';

export default function BookingsPage() {
  const { selectedBooking, isDrawerOpen, openDrawer, closeDrawer } = useBookingSelection();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter state
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cancel dialog state
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  // Simulate network latency for skeleton testing
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter data based on active tab and search
  const filteredBookings = useMemo(() => {
    let result = [...mockBookings];

    // Tab filtering
    switch (activeTab) {
      case 'pending':
        result = result.filter(b => b.status === 'Pending' || b.status === 'Confirmed');
        break;
      case 'home':
        result = result.filter(b => b.collection.type === 'Home Collection');
        break;
      case 'today':
        // Mock: show bookings from "today" — in production this checks real dates
        result = result.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled');
        break;
      default:
        break;
    }

    // Search filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(b => 
        b.id.toLowerCase().includes(q) ||
        b.patient.name.toLowerCase().includes(q) ||
        b.patient.phone.includes(q)
      );
    }

    return result;
  }, [activeTab, searchQuery]);

  // Pagination calculations
  const totalItems = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedData = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Cancel booking handler
  const handleCancelBooking = useCallback((booking: Booking) => {
    setCancelTarget(booking);
  }, []);

  const confirmCancelBooking = useCallback(() => {
    if (cancelTarget) {
      // Frontend-only state update — in production this calls an API
      success('Booking cancelled', `${cancelTarget.id} has been cancelled successfully`);
      setCancelTarget(null);
      closeDrawer();
    }
  }, [cancelTarget, success, closeDrawer]);

  // Status update handler
  const handleStatusUpdate = useCallback((booking: Booking, newStatus: BookingStatus) => {
    // Frontend-only — in production this calls an API
    success('Status updated', `${booking.id} has been updated to ${newStatus}`);
  }, [success]);

  const kpiSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <KPICard 
        title="Total Bookings" 
        value="1,248" 
        icon="calendar"
        trend={{ value: 12.5, isPositive: true, label: 'vs last 30 days' }}
        iconBgColor="bg-red-50"
        iconColor="text-red-500"
      />
      <KPICard 
        title="Pending" 
        value="86" 
        icon="clock"
        trend={{ value: 8, isPositive: false, label: 'Needs attention' }}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-500"
      />
      <KPICard 
        title="Home Collections" 
        value="712" 
        icon="mapPin"
        trend={{ value: 57, isPositive: true, label: 'of total' }}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-500"
      />
      <KPICard 
        title="Revenue Today" 
        value="₹45,780" 
        icon="creditCard"
        trend={{ value: 8.2, isPositive: true, label: 'vs yesterday' }}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-500"
      />
    </div>
  );

  const toolbar = (
    <BookingsFilterBar
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    />
  );

  return (
    <>
      <AdminPageTemplate
        kpiSection={kpiSection}
      >
        <div style={{ marginBottom: '40px' }}>
          <AdminCard padding="none" className="overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200" style={{ padding: '24px' }}>
              {toolbar}
            </div>
        <BookingsTable 
          data={paginatedData} 
          isLoading={isLoading} 
          onRowClick={(booking) => openDrawer(booking.id)} 
          onCancelBooking={handleCancelBooking}
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage,
            onPageChange: setCurrentPage,
            onItemsPerPageChange: (items: number) => {
              setItemsPerPage(items);
              setCurrentPage(1);
            }
          }}
          className="border-none shadow-none rounded-none bg-transparent"
        />
        </AdminCard>
        </div>
      </AdminPageTemplate>

      <BookingDetailsDrawer 
        booking={selectedBooking}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onCancelBooking={handleCancelBooking}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Cancel Booking Confirmation Dialog */}
      <AdminDialog
        isOpen={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        title="Cancel Booking"
        description={cancelTarget ? `Are you sure you want to cancel booking ${cancelTarget.id} for ${cancelTarget.patient.name}? This action cannot be undone.` : ''}
        size="sm"
        footer={
          <>
            <DialogFooterCancel onClose={() => setCancelTarget(null)} label="Keep Booking" />
            <DialogFooterConfirm onClick={confirmCancelBooking} label="Cancel Booking" variant="danger" />
          </>
        }
      />
    </>
  );
}
