"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export interface BookingSummarySidebarProps {
  currentStep: number;
  collectionType: 'home' | 'lab';
  selectedPatientId: string;
  paymentMethod: string;
  handleNextStep: () => void;
  handleConfirmBooking: (e: React.FormEvent) => void;
  checkoutError: string;
  setCheckoutError: (error: string) => void;
  isSubmitting: boolean;
}

export function BookingSummarySidebar({
  currentStep,
  collectionType,
  selectedPatientId,
  paymentMethod,
  handleNextStep,
  handleConfirmBooking,
  checkoutError,
  setCheckoutError,
  isSubmitting
}: BookingSummarySidebarProps) {
  const { items, subtotal, totalSavings, collectionFee, totalAmount } = useCart();
  const { user } = useAuth();

  return (
    <Card className="sticky top-24">
      <Card.Header className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-border/50 pb-5 gap-3">
        <Card.Title className="text-xl m-0 whitespace-nowrap">Order Summary</Card.Title>
        <span className="text-xs font-bold uppercase px-2.5 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full self-start xl:self-auto shrink-0">
          NABL Guaranteed
        </span>
      </Card.Header>

      <Card.Content>
        <div className="space-y-6 text-[15px] text-muted-foreground mt-6">
          <div className="space-y-3 pb-4 border-b border-border/40">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-start text-sm">
                <div className="flex-1 pr-3">
                  <span className="font-medium text-foreground line-clamp-2">{item.title}</span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-1 inline-block">Qty: {item.quantity}</span>
                </div>
                <span className="font-bold text-foreground shrink-0 mt-0.5">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <span>Tests Subtotal</span>
            <span className="font-semibold text-foreground text-base">₹{subtotal}</span>
          </div>
          {totalSavings > 0 && (
            <div className="flex justify-between items-center text-green-600 font-semibold">
              <span>Your Savings</span>
              <span>- ₹{totalSavings}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span>Home Sample Collection Fee</span>
            <span className="font-semibold text-foreground">
              {collectionFee === 0 ? <span className="text-green-600 font-bold tracking-wide">FREE</span> : `₹${collectionFee}`}
            </span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold text-foreground pt-6 mt-3 border-t border-border">
            <span>Total Payable</span>
            <span className="text-primary text-2xl font-extrabold">₹{totalAmount}</span>
          </div>
          
          {/* Contextual Journey Summary */}
          {currentStep > 1 && (
            <div className="pt-6 mt-6 border-t border-border/60 space-y-7 relative before:absolute before:left-[11px] before:top-10 before:bottom-5 before:w-[2px] before:bg-border/60">
              <div className="flex gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-200 shadow-sm mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="flex-1 pb-2 min-w-0">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Collection Mode</p>
                  <p className="text-[15px] font-bold text-foreground m-0 truncate">{collectionType === 'home' ? 'Home Sample Collection' : 'Visit Lab Center'}</p>
                </div>
              </div>
              
              {currentStep > 2 && (
                <div className="flex gap-4 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-200 shadow-sm mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div className="flex-1 pb-2 min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Patient Profile</p>
                    <p className="text-[15px] font-bold text-foreground m-0 truncate">
                      {selectedPatientId === 'myself' ? (user?.fullName || 'Myself') : user?.savedPatients?.find(p => p.id === selectedPatientId)?.name || 'Selected'}
                    </p>
                  </div>
                </div>
              )}

              {currentStep > 3 && (
                <div className="flex gap-4 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-200 shadow-sm mt-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Payment Method</p>
                    <p className="text-[15px] font-bold text-foreground uppercase m-0 truncate">{paymentMethod}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {checkoutError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-xs text-red-800 mt-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-red-500 shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="font-medium">{checkoutError}</span>
            <button
              type="button"
              className="ml-auto text-red-400 hover:text-red-600 border-none bg-transparent cursor-pointer text-sm"
              onClick={() => setCheckoutError('')}
            >
              ×
            </button>
          </div>
        )}

        <div className="space-y-4 pt-6">
          {currentStep < 4 ? (
            <Button 
              type="button" 
              variant="primary"
              className="w-full font-bold"
              onClick={handleNextStep}
              disabled={currentStep === 1 && items.length === 0}
            >
              Continue to {currentStep === 1 ? 'Schedule' : currentStep === 2 ? 'Patient Details' : 'Payment'} &rarr;
            </Button>
          ) : (
            <Button 
              type="button" 
              variant="primary"
              className="w-full font-bold"
              onClick={handleConfirmBooking}
              isLoading={isSubmitting}
              disabled={isSubmitting || items.length === 0}
            >
              Confirm & Schedule
            </Button>
          )}
          
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5 font-medium m-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            100% Secure & Safe Booking
          </p>
        </div>
      </Card.Content>
    </Card>
  );
}
