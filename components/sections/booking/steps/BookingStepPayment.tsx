"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';

export interface BookingStepPaymentProps {
  paymentMethod: 'cash' | 'upi' | 'card';
  setPaymentMethod: (method: 'cash' | 'upi' | 'card') => void;
}

export function BookingStepPayment({
  paymentMethod,
  setPaymentMethod
}: BookingStepPaymentProps) {
  return (
    <Card className="relative mb-0">
      <Card.Header className="flex flex-row items-center justify-between border-b border-border/60 pb-4 mb-2">
        <Card.Title className="m-0 tracking-tight">Payment Mode</Card.Title>
      </Card.Header>

      <Card.Content>
        <div className="space-y-3">
          {[
            { id: 'cash', title: 'Pay on Collection / Visit (Cash or UPI)', desc: 'Pay directly to phlebotomist or at lab center.' },
            { id: 'upi', title: 'Online UPI / QR Code', desc: 'Instant GPay, PhonePe, Paytm QR code payment.' },
            { id: 'card', title: 'Credit / Debit Card', desc: 'Secure online card payment.' },
          ].map((method) => (
            <label 
              key={method.id} 
              className={`booking-option-row items-center ${paymentMethod === method.id ? 'is-selected' : ''}`}
            >
              <input 
                type="radio" 
                name="payment" 
                checked={paymentMethod === method.id}
                onChange={() => setPaymentMethod(method.id as 'cash' | 'upi' | 'card')}
                className="w-4 h-4 mt-0.5 shrink-0 accent-primary cursor-pointer"
              />
              <div className="ml-3">
                <p className="text-sm font-semibold text-foreground mb-1">{method.title}</p>
                <p className="text-xs text-muted-foreground mb-0">{method.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}
