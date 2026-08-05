import React from 'react';
import Link from 'next/link';

export interface FormSplitLayoutProps {
  sidebarContent: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormSplitLayout({ sidebarContent, children, className = '' }: FormSplitLayoutProps) {
  return (
    <div className={`booking-layout ${className}`}>
      <div className="booking-sidebar">
        <Link href="/" className="booking-logo block">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 inline-block mr-2"><path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1M9 14h2M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2ZM12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>
          Agam Diagnostics
        </Link>
        {sidebarContent}
      </div>
      <div className="booking-main">
        {children}
      </div>
    </div>
  );
}
