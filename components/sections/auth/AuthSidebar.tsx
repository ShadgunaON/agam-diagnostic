import React from 'react';

export interface AuthSidebarProps {
  className?: string;
}

export function AuthSidebar({ className = '' }: AuthSidebarProps) {
  return (
    <div className="booking-sidebar">
      <a href="/" className="booking-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1M9 14h2M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2ZM12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>
        Agam Diagnostics
      </a>
      
      <div className={`booking-summary ${className}`} id="sidebar-text">
        <div className="booking-summary__pill" style={{ fontSize: '11px' }}>Secure Access</div>
        <div className="booking-summary__title" style={{ fontSize: '32px' }}>Welcome<br/>Back</div>
        <p style={{ opacity: 0.8, fontSize: '14px' }}>Log in to access your profile, book tests, and view reports.</p>
      </div>
    </div>
  );
}
