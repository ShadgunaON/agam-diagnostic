'use client';

import React, { useState } from 'react';
import { Input, Textarea, Button } from '@/components/ui';

export interface ContactFormProps {
  className?: string;
}

export function ContactForm({ className = '' }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateInquiry($input: String!) {
              createInquiry(input: $input)
            }
          `,
          variables: {
            input: JSON.stringify(data),
          },
        }),
      });

      const res = await response.json();

      if (res.errors) {
        throw new Error(res.errors[0]?.message || 'Failed to submit inquiry');
      }

      setStatus('success');
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={`space-y-6 ${className}`} onSubmit={handleSubmit}>
      {status === 'success' && (
        <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
          Thank you for reaching out! Your message has been sent successfully. We will get back to you shortly.
        </div>
      )}
      
      {status === 'error' && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="contact-firstName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">First Name</label>
          <Input id="contact-firstName" name="firstName" placeholder="John" required disabled={loading} />
        </div>
        <div className="space-y-2">
          <label htmlFor="contact-lastName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Last Name</label>
          <Input id="contact-lastName" name="lastName" placeholder="Doe" required disabled={loading} />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="contact-email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
        <Input id="contact-email" name="email" type="email" placeholder="john.doe@example.com" required disabled={loading} />
      </div>
      <div className="space-y-2">
        <label htmlFor="contact-message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Message</label>
        <Textarea id="contact-message" name="message" placeholder="How can we help you?" className="min-h-[120px]" required disabled={loading} />
      </div>
      <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
