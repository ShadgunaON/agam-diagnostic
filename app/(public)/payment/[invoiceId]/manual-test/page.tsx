"use client";

/**
 * MANUAL TEST PAYMENT PAGE
 * ─────────────────────────────────────────────────────────────────────────────
 * Development/Test mode ONLY. Active when PAYMENT_MODE=manual_test on the
 * Lambda AND NEXT_PUBLIC_PAYMENT_MODE=manual_test in the frontend env.
 *
 * This page replaces the PhonePe checkout for development testing.
 * It calls the real `manualTestPayment` GraphQL mutation which applies
 * authoritative backend state changes:
 *   SUCCESS → Invoice.paymentStatus = 'Paid', Booking.paymentStatus = 'Paid'
 *   FAILURE → No state change; user redirected to retry
 *
 * The real PhonePe SDK integration is NOT modified by this page.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { invoiceService, bookingService } from '@/services';
import { paymentService } from '@/services';
import { InvoiceModel } from '@/domains/invoice/model';
import { BookingModel } from '@/domains/booking/model';

export default function ManualTestPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId as string;

  const [invoice, setInvoice] = useState<InvoiceModel | null>(null);
  const [booking, setBooking] = useState<BookingModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'failure'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!invoiceId) return;
    const load = async () => {
      try {
        const invRes = await invoiceService.getById(invoiceId);
        if (invRes.isSuccess && invRes.value) {
          setInvoice(invRes.value);
          if (invRes.value.bookingId) {
            const bkRes = await bookingService.getById(invRes.value.bookingId);
            if (bkRes.isSuccess) setBooking(bkRes.value);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [invoiceId]);

  const handleDecision = async (decision: 'SUCCESS' | 'FAILURE') => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const res = await paymentService.manualTestPayment(invoiceId, decision);
      if (res.isSuccess) {
        if (decision === 'SUCCESS') {
          setResult('success');
        } else {
          setResult('failure');
        }
      } else {
        setErrorMsg(res.error?.message || 'Backend call failed');
        setIsProcessing(false);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Unexpected error');
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    if (result === 'success') {
      router.push(`/book/success/${invoice?.bookingId}`);
    } else {
      router.push(`/payment/${invoiceId}`);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: 'monospace' }}>
        <div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading invoice…</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'JetBrains Mono', 'Courier New', monospace"
    }}>
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        {/* DEV MODE BADGE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
          <div style={{
            background: '#f59e0b22',
            border: '1px solid #f59e0b55',
            color: '#f59e0b',
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '6px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            ⚠ Manual Test Mode
          </div>
          <span style={{ color: '#475569', fontSize: '11px' }}>Payment simulation</span>
        </div>

        {result === 'idle' && (
          <>
            {/* PhonePe lookalike header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '64px', height: '64px',
                background: 'linear-gradient(135deg, #5f3dc4, #7048e8)',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px'
              }}>💳</div>
              <h1 style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>
                Sandbox Payment
              </h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                Simulate PhonePe UAT response
              </p>
            </div>

            {/* Order details */}
            <div style={{
              background: '#0f172a',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '28px',
              border: '1px solid #1e3a5f'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>Invoice</span>
                <span style={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace' }}>{invoiceId.slice(-8)}</span>
              </div>
              {booking && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>Patient</span>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>{booking.patient?.name}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #1e293b', marginTop: '4px' }}>
                <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>Amount</span>
                <span style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: 800 }}>₹{invoice?.total || 0}</span>
              </div>
            </div>

            {errorMsg && (
              <div style={{
                background: '#450a0a', border: '1px solid #7f1d1d',
                borderRadius: '8px', padding: '12px', marginBottom: '20px',
                color: '#fca5a5', fontSize: '13px'
              }}>
                {errorMsg}
              </div>
            )}

            {/* Decision buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                id="manual-payment-success-btn"
                disabled={isProcessing}
                onClick={() => handleDecision('SUCCESS')}
                style={{
                  background: isProcessing ? '#134e2a66' : 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  boxShadow: isProcessing ? 'none' : '0 4px 16px rgba(22,163,74,0.35)',
                  opacity: isProcessing ? 0.7 : 1
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '20px' }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {isProcessing ? 'Processing…' : 'Simulate Payment SUCCESS'}
              </button>

              <button
                id="manual-payment-failure-btn"
                disabled={isProcessing}
                onClick={() => handleDecision('FAILURE')}
                style={{
                  background: 'transparent',
                  color: '#f87171',
                  border: '1px solid #7f1d1d',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  opacity: isProcessing ? 0.5 : 1
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Simulate Payment FAILURE
              </button>
            </div>

            <p style={{ textAlign: 'center', color: '#475569', fontSize: '11px', marginTop: '20px', lineHeight: 1.6 }}>
              This UI replaces the real PhonePe Sandbox. Both outcomes<br/>
              are processed by the real backend — no mocks.
            </p>
          </>
        )}

        {result === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '72px', height: '72px',
              background: '#14532d44',
              border: '2px solid #16a34a',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              animation: 'pulse 1s ease'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" style={{ width: '36px' }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ color: '#4ade80', fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
              Payment Successful
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '28px' }}>
              Backend confirmed. Invoice &amp; booking updated to Paid.
            </p>
            <button
              onClick={handleContinue}
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#fff', border: 'none', borderRadius: '12px',
                padding: '14px 32px', fontSize: '15px', fontWeight: 700,
                cursor: 'pointer', width: '100%'
              }}
            >
              View Receipt →
            </button>
          </div>
        )}

        {result === 'failure' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '72px', height: '72px',
              background: '#450a0a44',
              border: '2px solid #dc2626',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3" style={{ width: '36px' }}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
            <h2 style={{ color: '#f87171', fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
              Payment Failed
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '28px' }}>
              No state was changed. Invoice remains Pending.
            </p>
            <button
              onClick={handleContinue}
              style={{
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '14px 32px', fontSize: '15px', fontWeight: 600,
                cursor: 'pointer', width: '100%'
              }}
            >
              ← Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
