import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { ProgressiveBookingFlow } from '@/components/sections/booking/ProgressiveBookingFlow';

export const metadata: Metadata = {
  title: `Smart Booking | ${siteConfig.name}`,
  description: 'Schedule a diagnostic test with Agam Diagnostics. Book a free home sample collection.',
};

export default function BookTestPage() {
  return (
    <ProgressiveBookingFlow />
  );
}
