import React from 'react';
import Link from 'next/link';
import { Section, Container, Grid } from '@/components/ui';

export function PackagesCategorySection() {
  return (
    <section id="browse-category" className="section">
      <div className="container">
        <div className="section-header section-header--center" style={{ marginBottom: 'var(--sp-8)' }}>
          <div className="section-header__overline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            Browse by Category
          </div>
          <h2 className="section-header__title">Find the Right Package for You</h2>
          <p className="section-header__desc">Our health packages are organized into three categories based on gender-specific needs and modern lifestyle risks. Choose yours below.</p>
        </div>
        <div className="grid grid--3 reveal">
          
          {/* Women's Health Category */}
          <Link href="/women-health" className="card--service" style={{ textDecoration: 'none', padding: 'var(--sp-6)' }}>
            <div className="card__icon" style={{ background: '#FCE7F3', marginBottom: 'var(--sp-5)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#DB2777" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <h3 className="card__title" style={{ color: 'var(--color-primary)', marginBottom: 'var(--sp-2)' }}>Women&apos;s Health</h3>
            <p className="card__desc" style={{ marginBottom: 'var(--sp-5)' }}>Hormonal health, thyroid screening, PCOS profiling, bone density markers, pregnancy care, and comprehensive women&apos;s wellness checkups.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Hormonal Care</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Pregnancy</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Bone Health</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Thyroid</span>
            </div>
            <span className="card__link">Explore 6 Packages <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
          </Link>

          {/* Men's Health Category */}
          <Link href="/men-health" className="card--service" style={{ textDecoration: 'none', padding: 'var(--sp-6)' }}>
            <div className="card__icon" style={{ background: '#DBEAFE', marginBottom: 'var(--sp-5)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className="card__title" style={{ color: 'var(--color-primary)', marginBottom: 'var(--sp-2)' }}>Men&apos;s Health</h3>
            <p className="card__desc" style={{ marginBottom: 'var(--sp-5)' }}>Executive health profiles, cardiac risk assessment, liver & kidney function, prostate screening, metabolic panels, and preventive checkups for men.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Executive Health</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Heart Care</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Metabolic</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Liver Health</span>
            </div>
            <span className="card__link">Explore 6 Packages <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
          </Link>

          {/* Lifestyle Health Category */}
          <Link href="/lifestyle-health" className="card--service" style={{ textDecoration: 'none', padding: 'var(--sp-6)' }}>
            <div className="card__icon" style={{ background: '#ECFCCB', marginBottom: 'var(--sp-5)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#65A30D" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <h3 className="card__title" style={{ color: 'var(--color-primary)', marginBottom: 'var(--sp-2)' }}>Lifestyle Health</h3>
            <p className="card__desc" style={{ marginBottom: 'var(--sp-5)' }}>Diabetic screening, obesity risk profiling, vitamin deficiency panels, corporate executive checkups, smoker&apos;s risk assessment, and fitness evaluations.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginBottom: 'var(--sp-5)' }}>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Diabetes</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Stress</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Fitness</span>
              <span className="badge badge--primary" style={{ fontSize: '10px' }}>Obesity</span>
            </div>
            <span className="card__link">Explore 6 Packages <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
          </Link>

        </div>
      </div>
    </section>
  );
}
