"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

// Extracted Sub-Components
import { BookingStepper } from './BookingStepper';
import { BookingSummarySidebar } from './BookingSummarySidebar';
import { BookingConfirmation } from './BookingConfirmation';
import { BookingStepCart } from './steps/BookingStepCart';
import { BookingStepSchedule, AVAILABLE_TIMESLOTS } from './steps/BookingStepSchedule';
import { BookingStepPatient } from './steps/BookingStepPatient';
import { BookingStepPayment } from './steps/BookingStepPayment';
import { AddAddressModal } from './modals/AddAddressModal';
import { AddFamilyModal } from './modals/AddFamilyModal';

export interface BookingProcessSectionProps {
  className?: string;
}

export function BookingProcessSection({ className = '' }: BookingProcessSectionProps) {
  const router = useRouter();
  const { items, clearCart, totalAmount } = useCart();
  const { user, isAuthenticated, updateProfile, addPatient, addAddress } = useAuth();
  const searchParams = useSearchParams();

  // Core Booking State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [collectionType, setCollectionType] = useState<'home' | 'lab'>('home');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('slot-1');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('myself');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');

  // Address State
  const [selectedAddressId, setSelectedAddressId] = useState<string>('default_home');
  const [inlineAddress, setInlineAddress] = useState(user?.address || '');
  const [inlineCity, setInlineCity] = useState(user?.city || 'Madurai');
  const [inlinePincode, setInlinePincode] = useState(user?.pincode || '625001');

  // Modals
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);

  // Submission & Confirmation State
  const [checkoutError, setCheckoutError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedItems, setConfirmedItems] = useState<typeof items>([]);
  const [bookingConfirmation, setBookingConfirmation] = useState<{
    bookingId: string;
    patientName: string;
    addressOrLab: string;
    date: string;
    slotTime: string;
    totalPayable: number;
  } | null>(null);

  // Hydrate from URL intent (after login redirect)
  useEffect(() => {
    if (searchParams) {
      queueMicrotask(() => {
        const type = searchParams.get('collectionType');
        const date = searchParams.get('date');
        const slot = searchParams.get('slot');
        const patient = searchParams.get('patient');
        const payment = searchParams.get('payment');

        if (type) setCollectionType(type as 'home' | 'lab');
        if (date) setSelectedDate(date);
        if (slot) setSelectedSlot(slot);
        if (patient) setSelectedPatientId(patient);
        if (payment) setPaymentMethod(payment as 'cash' | 'upi' | 'card');
      });
    }
  }, [searchParams]);

  // Sync inline address when user profile loads
  useEffect(() => {
    if (user?.address) {
      queueMicrotask(() => {
        setInlineAddress(user.address || '');
      });
    }
  }, [user?.address]);

  // Actions
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      const params = new URLSearchParams();
      params.set('returnUrl', '/book');
      if (collectionType) params.set('collectionType', collectionType);
      if (selectedDate) params.set('date', selectedDate);
      if (selectedSlot) params.set('slot', selectedSlot);
      if (selectedPatientId) params.set('patient', selectedPatientId);
      if (paymentMethod) params.set('payment', paymentMethod);
      
      router.push(`/login?${params.toString()}`);
      return;
    }

    setCheckoutError('');
    if (collectionType === 'home' && (!user.address && !inlineAddress.trim())) {
      setCheckoutError('Please enter your pickup address to proceed with Home Sample Collection.');
      return;
    }

    if (collectionType === 'home' && inlineAddress.trim()) {
      updateProfile({
        address: inlineAddress,
        city: inlineCity,
        pincode: inlinePincode,
        preferredAddress: `${inlineAddress}, ${inlineCity} - ${inlinePincode}`,
      });
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    let selectedPatientName = user.fullName;
    if (selectedPatientId !== 'myself') {
      const found = user.savedPatients.find((p) => p.id === selectedPatientId);
      if (found) {
        selectedPatientName = `${found.name} (${found.relation})`;
      }
    }

    const addressOrLab = collectionType === 'home'
      ? (inlineAddress ? `${inlineAddress}, ${inlineCity} - ${inlinePincode}` : (user.preferredAddress || 'Home Address'))
      : 'AGAM Diagnostics Lab Center, Anna Nagar 80 Feet Road, Madurai';

    const timeSlotObj = AVAILABLE_TIMESLOTS.find((s) => s.id === selectedSlot);

    setConfirmedItems([...items]);

    setBookingConfirmation({
      bookingId: `AGAM-BOOK-${Math.floor(10000 + Math.random() * 90000)}`,
      patientName: selectedPatientName,
      addressOrLab,
      date: selectedDate,
      slotTime: timeSlotObj ? timeSlotObj.time : '09:00 AM - 11:00 AM',
      totalPayable: totalAmount,
    });

    setIsSubmitting(false);
    clearCart();
  };

  const handleNextStep = () => {
    if (currentStep === 1 && items.length === 0) return;
    if (currentStep === 2 && collectionType === 'home' && !user?.address && !inlineAddress.trim()) {
      setCheckoutError('Please enter your pickup address.');
      return;
    }
    setCheckoutError('');
    setCurrentStep(prev => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render Confirmation Screen
  if (bookingConfirmation) {
    return (
      <BookingConfirmation 
        className={className} 
        bookingConfirmation={bookingConfirmation} 
        confirmedItems={confirmedItems} 
      />
    );
  }

  // Render Main Flow
  return (
    <div className={`booking-step-content w-full ${className}`}>
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-6 font-semibold no-underline hover:text-primary transition-colors">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to Home
      </Link>

      <BookingStepper currentStep={currentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start fade-in-up">
        {/* LEFT COLUMN: Booking Steps */}
        <div className="lg:col-span-6 space-y-8">
          {currentStep === 1 && <BookingStepCart />}
          
          {currentStep === 2 && (
            <BookingStepSchedule 
              collectionType={collectionType}
              setCollectionType={setCollectionType}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
              inlineAddress={inlineAddress}
              setInlineAddress={setInlineAddress}
              inlineCity={inlineCity}
              setInlineCity={setInlineCity}
              inlinePincode={inlinePincode}
              setInlinePincode={setInlinePincode}
              setShowAddAddressModal={setShowAddAddressModal}
            />
          )}

          {currentStep === 3 && (
            <BookingStepPatient 
              selectedPatientId={selectedPatientId}
              setSelectedPatientId={setSelectedPatientId}
              setShowAddFamilyModal={setShowAddFamilyModal}
            />
          )}

          {currentStep === 4 && (
            <BookingStepPayment 
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          )}

          {/* WIZARD NAVIGATION BUTTONS */}
          <div className="flex items-center justify-between pt-2 pb-8">
            <button 
              type="button"
              onClick={handlePrevStep}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-border/60 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-muted-foreground hover:bg-bg-alt hover:text-foreground hover:border-border'}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="15 18 9 12 15 6"></polyline></svg>
              Back
            </button>

            {currentStep < 4 ? (
              <button 
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-primary text-white rounded-lg transition-all hover:bg-primary-dark shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentStep === 1 && items.length === 0}
              >
                Continue
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleConfirmBooking}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-primary text-white rounded-lg transition-all hover:bg-primary-dark shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? 'Confirming...' : 'Confirm'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="5 12 10 17 19 8"></polyline></svg>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <div className="lg:col-span-6 order-2 lg:order-none mt-8 lg:mt-0">
          <BookingSummarySidebar 
            currentStep={currentStep}
            collectionType={collectionType}
            selectedPatientId={selectedPatientId}
            paymentMethod={paymentMethod}
            handleNextStep={handleNextStep}
            handleConfirmBooking={handleConfirmBooking}
            checkoutError={checkoutError}
            setCheckoutError={setCheckoutError}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      {/* MODALS */}
      <AddAddressModal 
        isOpen={showAddAddressModal} 
        setIsOpen={setShowAddAddressModal} 
        onAddAddress={addAddress} 
      />
      <AddFamilyModal 
        isOpen={showAddFamilyModal} 
        setIsOpen={setShowAddFamilyModal} 
        onAddPatient={addPatient} 
      />
    </div>
  );
}
