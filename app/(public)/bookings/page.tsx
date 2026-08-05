"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/common';

export default function BookingsPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <AuthGuard>
      <div className="container" style={{ paddingTop: 'var(--sp-10)', paddingBottom: 'var(--sp-10)' }}>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-1">My Bookings</h1>
          <p className="text-sm text-muted-foreground">
            {isAuthenticated
              ? `Welcome back, ${user?.fullName || 'Patient'}. Your appointment history will appear here.`
              : 'Log in to view and manage your booking history.'}
          </p>
        </div>

        {/* Empty State */}
        <div className="bg-white border border-border rounded-2xl p-10 md:p-16 text-center shadow-sm max-w-2xl mx-auto">
          {/* Animated empty icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-bg-alt rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-muted-foreground/50">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <line x1="8" y1="14" x2="10" y2="14"/>
              <line x1="14" y1="14" x2="16" y2="14"/>
              <line x1="8" y1="18" x2="10" y2="18"/>
            </svg>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">No Bookings Yet</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Your booking history will appear here once you schedule a test or health package.
            Book now and get certified lab results delivered digitally.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button href="/tests" className="btn btn--primary btn--sm text-sm font-bold px-6">

              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Browse Tests
            
</Button>
            <Button href="/health-packages" className="btn btn--outline btn--sm text-sm px-6">

              Explore Packages
            
</Button>
          </div>

          {/* Trust badges */}
          <div className="mt-10 pt-6 border-t border-border flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" className="w-4 h-4">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              NABL Accredited
            </div>
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" className="w-4 h-4">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Certified Phlebotomists
            </div>
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" className="w-4 h-4">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Digital Reports
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
