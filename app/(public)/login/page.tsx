import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { FormSplitLayout } from '@/components/layout/FormSplitLayout';
import { AuthSidebar, AuthFormSection } from '@/components/sections/auth';

export const metadata: Metadata = {
  title: `Login | ${siteConfig.name}`,
  description: 'Log in to access your profile, book tests, and view reports at Agam Diagnostics.',
};

export default function LoginPage() {
  return (
    <div className="booking-layout">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Typography Overrides for Login */
        h2 { font-size: 24px; margin-bottom: 6px; }
        .step-subtitle { font-size: 13px; margin-bottom: 24px; color: var(--color-text-light); }
        .form-group label { font-size: 12px; font-weight: 500; margin-bottom: 6px; }
        .form-control { font-size: 14px; padding: 10px 12px; }
        .btn-continue { font-size: 14px; padding: 10px 16px; }
        
        .auth-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 4px;
          background: rgba(229, 30, 62, 0.1);
          color: var(--color-primary);
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 10px 16px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: #fff;
          color: var(--color-dark);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 10px;
          transition: background 0.2s;
        }
        .social-btn:hover { background: #f8fafc; }
        .social-btn svg { width: 18px; height: 18px; }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: #94a3b8;
          font-size: 12px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--color-border);
        }
        .divider:not(:empty)::before { margin-right: 12px; }
        .divider:not(:empty)::after { margin-left: 12px; }
        
        .otp-input {
          text-align: center;
          font-size: 20px;
          font-weight: 600;
          padding: 12px;
          width: 48px;
        }
      `}} />
      <AuthSidebar />
      <div className="booking-main">
        <div className="booking-step-content" style={{ maxWidth: '380px', margin: 'auto 0', paddingTop: '40px' }}>
          <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
            <AuthFormSection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
