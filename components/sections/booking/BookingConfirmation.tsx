"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CartItem } from '@/context/CartContext';

export interface BookingConfirmationProps {
  className?: string;
  bookingConfirmation: {
    bookingId: string;
    patientName: string;
    addressOrLab: string;
    date: string;
    slotTime: string;
    totalPayable: number;
  };
  confirmedItems: CartItem[];
}

export function BookingConfirmation({ className = '', bookingConfirmation, confirmedItems }: BookingConfirmationProps) {
  return (
    <div className={`booking-step-content max-w-[560px] mx-auto py-10 ${className}`}>
      <Card className="p-8 text-center fade-in-up border-none shadow-lg">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 font-bold text-xs rounded-full uppercase tracking-wider mb-2">
          Booking Confirmed!
        </span>
        <h2 className="text-2xl font-extrabold text-foreground mb-1">Appointment Scheduled</h2>
        <p className="text-xs text-muted-foreground mb-6">
          Reference ID: <strong className="text-primary font-mono text-sm">{bookingConfirmation.bookingId}</strong>
        </p>

        <div className="bg-bg-alt border border-border rounded-xl p-5 text-left space-y-3 mb-6">
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-xs text-muted-foreground">Patient Name</span>
            <span className="text-xs font-bold text-foreground">{bookingConfirmation.patientName}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-xs text-muted-foreground">Scheduled Date</span>
            <span className="text-xs font-bold text-foreground">{bookingConfirmation.date}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-xs text-muted-foreground">Time Slot</span>
            <span className="text-xs font-bold text-foreground">{bookingConfirmation.slotTime}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-xs text-muted-foreground">Location</span>
            <span className="text-xs font-bold text-foreground max-w-[220px] text-right truncate">{bookingConfirmation.addressOrLab}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-xs font-bold text-foreground">Total Payable Amount</span>
            <span className="text-sm font-extrabold text-primary">₹{bookingConfirmation.totalPayable}</span>
          </div>
        </div>

        {confirmedItems.length > 0 && (
          <div className="bg-bg-alt border border-border rounded-xl p-4 mb-6 text-left">
            <h4 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Tests & Packages Booked</h4>
            <div className="space-y-2">
              {confirmedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      item.type === 'package' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.type === 'package' ? 'PKG' : 'TEST'}
                    </span>
                    <span className="text-xs text-foreground font-medium">{item.title}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 text-left mb-6 flex gap-3 items-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-blue-600 shrink-0">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          <div>
            <p className="font-bold mb-0.5">Phlebotomist Assignment Notification</p>
            <p className="text-xs text-blue-800">SMS confirmation and certified lab phlebotomist contact details will be sent 2 hours before your appointment.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline"
            size="sm"
            className="flex-1 justify-center text-xs"
            onClick={() => window.print()}
          >
            Print / Save Receipt
          </Button>
          <Button href="/tests" variant="primary" size="sm" className="flex-1 justify-center text-xs font-bold">
            Book Another Test
          </Button>
        </div>
        <Link href="/" className="block text-center text-xs text-muted-foreground mt-3 hover:text-primary transition-colors">
          ← Return to Home
        </Link>
      </Card>
    </div>
  );
}
