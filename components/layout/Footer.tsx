'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui';

export interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className={`footer ${className}`.trim()}>
        <Container>
          <div className="footer__grid flex flex-col md:grid md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-6 md:gap-8">
            <div className="footer__about">
              <div className="footer__logo">
                <img loading="lazy" src="https://www.agamdiagnostics.com/wp-content/uploads/2023/08/agam-site-logo.webp" alt="Agam Diagnostics" width="184" height="63" />
              </div>
              <p>Agam Diagnostics is Madurai&apos;s most trusted and advanced Medical lab, offering comprehensive diagnostic services with cutting-edge automation and international standards.</p>
            </div>
            <div>
              <h4>Quick Links</h4>
              <ul className="footer__links">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/services">Services</Link></li>
                <li><Link href="/tests">Health Tests</Link></li>
                <li><Link href="/health-packages">Health Packages</Link></li>
                <li><Link href="/reviews">Patient Reviews</Link></li>
                <li><Link href="/help">Help & Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4>Our Services</h4>
              <ul className="footer__links">
                <li><Link href="/services/rt-pcr">RT-PCR Testing</Link></li>
                <li><Link href="/services/master-health">Master Health Checkup</Link></li>
                <li><Link href="/services/molecular">Molecular Biology</Link></li>
                <li><Link href="/services/genetics">Medical Genetics</Link></li>
                <li><Link href="/services/immunology">Immunology</Link></li>
                <li><Link href="/services/haematology">Haematology</Link></li>
                <li><Link href="/services/microbiology">Clinical Microbiology</Link></li>
                <li><Link href="/services/biochemistry">Clinical Biochemistry</Link></li>
              </ul>
            </div>
            <div>
              <h4>Contact Us</h4>
              <ul className="footer__contact">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>Ground Floor, Plot No.17-R-1, 120 Feet Road, Vivekananda Nagar, Sambakulam, Madurai, Tamil Nadu - 625007</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  <a href="tel:+918940894079">+91 89408 94079</a>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <a href="mailto:support@agamdiagnostics.com">support@agamdiagnostics.com</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer__bottom">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              © 2026 
              <img loading="lazy" src="https://www.agamdiagnostics.com/wp-content/uploads/2023/08/agam-site-logo.webp" alt="Agam Diagnostics" width="80" height="27" style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }} /> 
              | All rights reserved
            </span>
            <div className="footer__bottom-links">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms">Terms &amp; Condition</Link>
            </div>
          </div>
        </Container>
      </footer>

      <button 
        type="button"
        className={`back-to-top ${isVisible ? 'is-visible' : ''}`.trim()} 
        aria-label="Back to top"
        onClick={scrollToTop}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
      </button>

      <Link href="/book" className="sticky-mobile-cta md:hidden">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Book Home Collection
      </Link>
    </>
  );
}
