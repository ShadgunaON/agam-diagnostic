import React from 'react';

export function PackagesAdvantageSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-8)' }}>
          <div className="section-header__overline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            The AGAM Advantage
          </div>
          <h2 className="section-header__title">Why Choose AGAM Packages</h2>
          <p className="section-header__desc">Every package at AGAM Diagnostics is designed with clinical precision, affordable pricing, and patient convenience at its core.</p>
        </div>
        <div className="grid grid--4 reveal">
          <div className="award-card award-card--premium">
            <div className="award-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div className="award-card__title">NABL Accredited</div>
            <div className="award-card__desc">Every test is processed in our NABL-certified laboratory, ensuring the highest accuracy and international quality standards.</div>
          </div>
          <div className="award-card award-card--premium">
            <div className="award-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div className="award-card__title">Free Home Collection</div>
            <div className="award-card__desc">Schedule a sample collection at your doorstep — available across Madurai city with trained phlebotomists.</div>
          </div>
          <div className="award-card award-card--premium">
            <div className="award-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </div>
            <div className="award-card__title">Same-Day Reports</div>
            <div className="award-card__desc">Receive your digital reports within 12–24 hours. Specialized tests may take 48 hours with real-time tracking.</div>
          </div>
          <div className="award-card award-card--premium">
            <div className="award-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div className="award-card__title">Expert Pathologists</div>
            <div className="award-card__desc">Every report is reviewed by senior pathologists with 15+ years of clinical experience before it reaches you.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
