import React from 'react';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `Smart Booking | ${siteConfig.name}`,
  description: 'Schedule a diagnostic test with Agam Diagnostics. Book a free home sample collection.',
};

export default function BookTestPage() {
  return (
    <div className="booking-layout">
      <style dangerouslySetInnerHTML={{ __html: `
        .toggle-group {
          display: flex;
          background: #f1f5f9;
          border-radius: 8px;
          padding: 4px;
          margin-bottom: 24px;
        }
        .toggle-btn {
          flex: 1;
          text-align: center;
          padding: 10px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toggle-btn.active {
          background: #fff;
          color: var(--color-primary);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          margin-bottom: 8px;
          background: #fff;
        }
        .cart-item h4 { margin: 0 0 4px 0; font-size: 14px; }
        .cart-item p { margin: 0; font-size: 12px; color: var(--color-text-light); }
        .cart-item .price { font-weight: 700; color: var(--color-primary); }
        .cart-item .remove { color: #ef4444; cursor: pointer; font-size: 12px; font-weight: 600; }
        
        .search-result {
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border);
          cursor: pointer;
        }
        .search-result:hover { background: #f8fafc; }
        .search-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 10;
          max-height: 200px;
          overflow-y: auto;
          display: none;
        }
        .booking-section-card {
          background: #fff;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--sp-6);
          box-shadow: 0 2px 8px rgba(11,27,61,0.04);
          margin-bottom: var(--sp-6);
        }
        .booking-section-card > h3:first-child {
          margin-top: 0;
          margin-bottom: var(--sp-5);
          padding-bottom: var(--sp-3);
          border-bottom: 1px solid var(--color-border);
          font-size: 16px;
          color: var(--color-dark);
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}} />
      <div className="booking-sidebar">
        <a href="/" className="booking-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1M9 14h2M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2ZM12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>
          Agam Diagnostics
        </a>
        
        <div className="booking-summary" id="sidebar-content">
          <div className="booking-summary__pill">Smart Booking</div>
          <div className="booking-summary__title">Schedule<br/>Test</div>
          <p style={{ opacity: 0.8, fontSize: 'var(--fs-lg)', marginBottom: '32px' }}>Build your cart and schedule a free home collection.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', fontWeight: 500, opacity: 0.9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" style={{ width: '16px' }}><polyline points="20 6 9 17 4 12"/></svg>
              NABL Accredited
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" style={{ width: '16px' }}><polyline points="20 6 9 17 4 12"/></svg>
              ICMR Approved
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" style={{ width: '16px' }}><polyline points="20 6 9 17 4 12"/></svg>
              Secure Booking
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" style={{ width: '16px' }}><polyline points="20 6 9 17 4 12"/></svg>
              Trusted by 50,000+ Patients
            </div>
          </div>
        </div>
      </div>

      <div className="booking-main">
        <div className="booking-step-content" style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100%' }}>
          
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--fs-sm)', color: 'var(--color-text-light)', marginBottom: 'var(--sp-6)', fontWeight: 500, textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px' }}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Home
          </a>

          {/* STEP: Smart Booking */}
          <div id="step-booking" className="fade-in-up">
            
            {/* A. BOOKING SUMMARY */}
            <div className="booking-section-card">
              <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Booking Summary</h3>
              <div id="cart-container" style={{ marginBottom: '16px' }}>
                <div className="cart-item">
                  <div>
                    <h4>Master Health Checkup</h4>
                    <span className="price">₹2,999</span>
                  </div>
                  <div className="remove">Remove</div>
                </div>
              </div>
              
              <div style={{ position: 'relative' }}>
                <input type="text" className="form-control" placeholder="Search and add tests..." id="test-search" autoComplete="off" />
                <div className="search-dropdown" id="test-dropdown"></div>
              </div>
            </div>

            {/* B. PATIENT DETAILS */}
            <div className="booking-section-card">
              <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Patient Details</h3>
            
              <div id="profile-banner" style={{ display: 'flex', background: 'rgba(11,27,61,0.03)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--color-border)', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-dark)' }} id="display-name">Priya S.</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-light)' }} id="display-details">+91 • Madurai</div>
                </div>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
              </div>

              <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Booking For</h3>
              <div className="toggle-group">
                <div className="toggle-btn active" id="toggle-myself">Myself</div>
                <div className="toggle-btn" id="toggle-family">Family Member</div>
              </div>
            </div>

            {/* C. APPOINTMENT TYPE */}
            <div className="booking-section-card">
              <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>How would you like to get tested?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <label className="appointment-card" style={{ border: '2px solid var(--color-primary)', background: '#f8fafc', padding: '16px', borderRadius: '8px', cursor: 'pointer', display: 'block', position: 'relative' }}>
                  <input type="radio" name="appt_type" value="home" defaultChecked style={{ display: 'none' }} />
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏠</div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: 'var(--color-dark)' }}>Home Sample Collection</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-light)', lineHeight: 1.4 }}>Comfortable, convenient, and available across supported locations.</div>
                  <div className="check-icon" style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--color-primary)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '16px' }}><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                </label>

                <label className="appointment-card" style={{ border: '1px solid var(--color-border)', background: '#fff', padding: '16px', borderRadius: '8px', cursor: 'pointer', display: 'block', position: 'relative', transition: 'all 0.2s' }}>
                  <input type="radio" name="appt_type" value="lab" style={{ display: 'none' }} />
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏥</div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: 'var(--color-dark)' }}>Visit Diagnostic Centre</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-light)', lineHeight: 1.4 }}>Visit your nearest AGAM Diagnostics centre at your preferred time.</div>
                  <div className="check-icon" style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--color-primary)', display: 'none' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: '16px' }}><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                </label>
              </div>
            </div>

            {/* D. LOCATION & TIME */}
            <div className="booking-section-card">
              <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Location &amp; Time</h3>
            
              <div id="home-collection-fields" style={{ display: 'block' }}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Collection Address</label>
                  <div style={{ padding: '12px', border: '1px solid var(--color-border)', borderRadius: '6px', background: '#fafafa', fontSize: '14px' }}>
                    <strong>Home</strong><br/>
                    <span id="display-address">Plot No.17-R-1, 120 Feet Road, Vivekananda Nagar, Sambakulam, Madurai</span>
                  </div>
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: '24px' }}>
                <div className="form-group has-date"><label>Date</label><input type="date" className="form-control" /></div>
                <div className="form-group"><label>Time Slot</label>
                  <select className="form-control"><option>6:30 AM – 8:00 AM</option><option>8:00 AM – 10:00 AM</option></select>
                </div>
              </div>
            </div>

            {/* E. REVIEW & CONFIRM */}
            <div className="booking-section-card">
              <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Review &amp; Confirm</h3>
              <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--fs-sm)', marginBottom: 'var(--sp-4)' }}>By clicking Confirm Booking, you agree to our Terms of Service.</p>
              <button type="button" className="btn-continue" id="btn-confirm" style={{ width: '100%', justifyContent: 'center' }}>Confirm Booking</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
