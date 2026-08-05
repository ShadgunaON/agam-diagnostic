import React from 'react';
import { Input, Textarea, Button } from '@/components/ui';

export interface ContactFormProps {
  className?: string;
}

/**
 * Reusable Contact Form structure.
 * Purely presentational; handles no state or submission logic natively.
 */
export function ContactForm({ className = '' }: ContactFormProps) {
  return (
    <form className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="contact-firstName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">First Name</label>
          <Input id="contact-firstName" name="firstName" placeholder="John" required />
        </div>
        <div className="space-y-2">
          <label htmlFor="contact-lastName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Last Name</label>
          <Input id="contact-lastName" name="lastName" placeholder="Doe" required />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="contact-email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
        <Input id="contact-email" name="email" type="email" placeholder="john.doe@example.com" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="contact-message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Message</label>
        <Textarea id="contact-message" name="message" placeholder="How can we help you?" className="min-h-[120px]" required />
      </div>
      <Button type="submit" className="w-full sm:w-auto">Send Message</Button>
    </form>
  );
}
