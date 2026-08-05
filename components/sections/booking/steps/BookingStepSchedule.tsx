"use client";

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export const AVAILABLE_TIMESLOTS = [
  { id: 'slot-1', time: '07:00 AM - 09:00 AM', label: 'Early Morning' },
  { id: 'slot-2', time: '09:00 AM - 11:00 AM', label: 'Morning' },
  { id: 'slot-3', time: '11:00 AM - 01:00 PM', label: 'Mid-day' },
  { id: 'slot-4', time: '02:00 PM - 05:00 PM', label: 'Afternoon' },
];

export interface BookingStepScheduleProps {
  collectionType: 'home' | 'lab';
  setCollectionType: (val: 'home' | 'lab') => void;
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  selectedSlot: string;
  setSelectedSlot: (val: string) => void;
  
  selectedAddressId: string;
  setSelectedAddressId: (val: string) => void;
  inlineAddress: string;
  setInlineAddress: (val: string) => void;
  inlineCity: string;
  setInlineCity: (val: string) => void;
  inlinePincode: string;
  setInlinePincode: (val: string) => void;
  
  setShowAddAddressModal: (val: boolean) => void;
}

export function BookingStepSchedule({
  collectionType,
  setCollectionType,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
  selectedAddressId,
  setSelectedAddressId,
  inlineAddress,
  setInlineAddress,
  inlineCity,
  setInlineCity,
  inlinePincode,
  setInlinePincode,
  setShowAddAddressModal
}: BookingStepScheduleProps) {
  const { user } = useAuth();
  const { collectionFee } = useCart();

  return (
    <div className="space-y-8">
      <Card className="relative">
        <Card.Header className="flex flex-row items-center justify-between border-b border-border/60 pb-4 mb-2">
          <Card.Title className="m-0 tracking-tight">Collection Mode</Card.Title>
        </Card.Header>

        <Card.Content>
          <div className="grid grid-cols-2 gap-5">
            <button 
              type="button"
              className={`booking-option-card ${collectionType === 'home' ? 'is-selected' : ''}`}
              onClick={() => setCollectionType('home')}
            >
              <div className="flex items-center justify-between mb-4 w-full">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${collectionType === 'home' ? 'bg-primary text-white' : 'bg-white text-muted-foreground border border-border'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                {collectionFee === 0 && (
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">FREE</span>
                )}
              </div>
              <div className="w-full text-left">
                <p className="font-extrabold text-sm text-foreground mb-1">Home Sample Collection</p>
                <p className="text-xs text-muted-foreground mb-0">Certified phlebotomist visits your doorstep.</p>
              </div>
            </button>

            <button 
              type="button"
              className={`booking-option-card ${collectionType === 'lab' ? 'is-selected' : ''}`}
              onClick={() => setCollectionType('lab')}
            >
              <div className="flex items-center justify-between mb-4 w-full">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${collectionType === 'lab' ? 'bg-primary text-white' : 'bg-white text-muted-foreground border border-border'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                  </svg>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">NO FEE</span>
              </div>
              <div className="w-full text-left">
                <p className="font-extrabold text-sm text-foreground mb-1">Visit Diagnostic Lab</p>
                <p className="text-xs text-muted-foreground mb-0">Walk in to AGAM Lab Center, Madurai.</p>
              </div>
            </button>
          </div>
        </Card.Content>
      </Card>

      <Card className="relative">
        <Card.Header className="flex flex-row items-center justify-between border-b border-border/60 pb-4 mb-2">
          <Card.Title className="m-0 tracking-tight">Appointment Schedule</Card.Title>
        </Card.Header>

        <Card.Content>
          <div className="form-group mb-6">
            <label className="block text-xs font-semibold mb-1.5 text-foreground">Preferred Date *</label>
            <Input 
              type="date" 
              className="w-full max-w-[200px] py-2.5 text-xs font-semibold h-auto"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {AVAILABLE_TIMESLOTS.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  className={`p-3 rounded-lg text-center transition-all cursor-pointer border ${
                    selectedSlot === slot.id 
                      ? 'border-primary bg-primary/[0.03] text-primary font-bold shadow-[0_0_0_1px_rgba(227,30,36,0.2)]' 
                      : 'border-border/60 bg-white text-foreground hover:border-border hover:bg-bg-alt/50'
                  }`}
                  onClick={() => setSelectedSlot(slot.id)}
                >
                  <div className="text-xs">{slot.time}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50/50 rounded-xl p-4 flex items-start gap-3 border border-blue-100/50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-600 shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <p className="text-xs text-blue-900 mb-0 font-medium leading-relaxed">
              Fast for 10-12 hours for accurate results. Only plain water is allowed during the fasting period.
            </p>
          </div>
        </Card.Content>
      </Card>

      {collectionType === 'home' && (
        <Card className="relative">
          <Card.Header className="flex flex-row items-center justify-between border-b border-border/60 pb-4 mb-2">
            <Card.Title className="m-0 tracking-tight">Pickup Address</Card.Title>
            {user?.savedAddresses && user.savedAddresses.length > 0 && (
              <button 
                type="button" 
                className="text-xs text-primary font-bold hover:underline border-none bg-transparent cursor-pointer"
                onClick={() => setShowAddAddressModal(true)}
              >
                + Add New Address
              </button>
            )}
          </Card.Header>

          <Card.Content>
            {user?.savedAddresses && user.savedAddresses.length > 0 ? (
              <div className="space-y-3">
                {user.savedAddresses.map((addr) => (
                  <label 
                    key={addr.id}
                    className={`booking-option-row ${selectedAddressId === addr.id ? 'is-selected' : ''}`}
                  >
                    <input 
                      type="radio"
                      name="address_select"
                      checked={selectedAddressId === addr.id}
                      onChange={() => {
                        setSelectedAddressId(addr.id);
                        setInlineAddress(addr.addressLine);
                        setInlineCity(addr.city);
                        setInlinePincode(addr.pincode);
                      }}
                      className="w-4 h-4 mt-0.5 shrink-0 accent-primary cursor-pointer"
                    />
                    <div className="flex-1 ml-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-extrabold uppercase px-1.5 py-0.5 bg-primary/10 text-primary rounded tracking-wider leading-none">
                            {addr.label}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-foreground mb-0 leading-tight">{addr.addressLine}, {addr.city} - {addr.pincode}</p>
                      </div>
                      {selectedAddressId === addr.id && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-primary shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <Input 
                  type="text"
                  className="text-xs py-2 h-auto font-normal"
                  placeholder="Enter Door No., Street, Area (e.g. Door 14, Anna Nagar Main Rd)"
                  value={inlineAddress}
                  onChange={(e) => setInlineAddress(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    type="text"
                    className="text-xs py-2 h-auto font-normal"
                    value={inlineCity}
                    onChange={(e) => setInlineCity(e.target.value)}
                    placeholder="City"
                  />
                  <Input 
                    type="text"
                    className="text-xs py-2 h-auto font-normal"
                    value={inlinePincode}
                    onChange={(e) => setInlinePincode(e.target.value)}
                    placeholder="PIN Code"
                  />
                </div>
              </div>
            )}
          </Card.Content>
        </Card>
      )}
    </div>
  );
}
