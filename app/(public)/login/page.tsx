import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { ProgressiveSignupForm } from '@/components/sections/auth/ProgressiveSignupForm';

export const metadata: Metadata = {
  title: `Login & Sign Up | ${siteConfig.name}`,
  description: 'Log in or create an account with Agam Diagnostics for faster bookings and access to your medical records.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <ProgressiveSignupForm />
    </Suspense>
  );
}
