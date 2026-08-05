"use client";

import React from 'react';

export interface BookingStepperProps {
  currentStep: number;
}

export function BookingStepper({ currentStep }: BookingStepperProps) {
  const steps = [
    { num: 1, label: 'Review Cart' },
    { num: 2, label: 'Schedule' },
    { num: 3, label: 'Patient Profile' },
    { num: 4, label: 'Payment' }
  ];

  return (
    <div className="flex justify-center w-full mb-8">
      <div className="booking-stepper fade-in-up">
        {steps.map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className={`booking-stepper__item ${currentStep > s.num ? 'is-completed' : currentStep === s.num ? 'is-active' : ''}`}>
              {currentStep > s.num ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-[#0A1B39]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === s.num ? 'bg-[#E31E24] text-white' : 'bg-bg-alt border border-border text-muted-foreground'}`}>
                  {s.num}
                </span>
              )}
              <span className={currentStep === s.num ? 'text-[#E31E24] font-bold' : currentStep > s.num ? 'text-[#0A1B39] font-bold' : 'text-muted-foreground'}>
                {s.label}
              </span>
            </div>
            {idx < 3 && <span className="w-8 h-[1px] bg-border mx-1 opacity-50 hidden sm:block"></span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
