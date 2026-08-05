'use client';

import { useState, useCallback } from 'react';
import { Booking, mockBookings } from '../../data/admin/mockBookings';

export function useBookingSelection() {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const selectedBooking = selectedBookingId 
    ? mockBookings.find(b => b.id === selectedBookingId) || null
    : null;

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
