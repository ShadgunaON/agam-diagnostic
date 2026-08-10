'use client';

import { useState, useCallback } from 'react';
import { Booking, BookingStatus } from '../../data/bookings';

export function useBookingSelection() {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const selectedBooking = null; // Removed mockBookings query; should be fetched from service if needed

  const openDrawer = useCallback((bookingId: string) => {
    setSelectedBookingId(bookingId);
  }, []);

  const closeDrawer = useCallback(() => {
    setSelectedBookingId(null);
  }, []);

  return {
    selectedBookingId,
    selectedBooking,
    openDrawer,
    closeDrawer,
    isDrawerOpen: selectedBookingId !== null
  };
}
