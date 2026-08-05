import React from 'react';
import { Input, Select, Button, Typography } from '@/components/ui';

export interface BookAppointmentFormProps {
  className?: string;
}

/**
 * Reusable Book Appointment Form structure.
 * Presentational structure only.
 */
export function BookAppointmentForm({ className = '' }: BookAppointmentFormProps) {
  return (
    <form className={`bg-background p-6 md:p-8 rounded-xl shadow-lg border border-border space-y-6 max-w-2xl mx-auto w-full ${className}`}>
      <Typography variant="h3" className="text-center mb-6">Book an Appointment</Typography>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="booking-name" className="text-sm font-medium">Full Name</label>
          <Input id="booking-name" name="name" placeholder="Enter your full name" required />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="booking-phone" className="text-sm font-medium">Phone Number</label>
          <Input id="booking-phone" name="phone" type="tel" placeholder="Enter your phone number" required />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="booking-date" className="text-sm font-medium">Preferred Date</label>
          <Input id="booking-date" name="date" type="date" required />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="booking-service" className="text-sm font-medium">Service / Test</label>
          <Select id="booking-service" name="service" required>
            <option value="">Select a service</option>
            <option value="blood-test">Complete Blood Count (CBC)</option>
            <option value="mri">MRI Scan</option>
            <option value="xray">X-Ray</option>
            <option value="health-package">Full Body Health Package</option>
            <option value="consultation">Doctor Consultation</option>
          </Select>
        </div>
      </div>
      
      <Button type="submit" size="lg" className="w-full mt-8">Confirm Booking</Button>
    </form>
  );
}
