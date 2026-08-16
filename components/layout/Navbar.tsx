"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavbarProps {
  className?: string;
}

export function Navbar({ className = '' }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className={`nav-links hidden lg:flex items-center gap-2 xl:gap-5 lg:text-[13px] xl:text-sm ${className}`.trim()} aria-label="Main Navigation">
      <style dangerouslySetInnerHTML={{ __html: `
        .nav-link { position: relative; padding-bottom: 4px; }
        .nav-link.is-active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #e31837; /* Red line */
          border-radius: 2px;
        }
      `}} />
      
      <Link href="/" className={`nav-link ${isActive('/') ? 'is-active' : ''}`}>Home</Link>
      <Link href="/about" className={`nav-link ${isActive('/about') ? 'is-active' : ''}`}>About Us</Link>
      <Link href="/services" className={`nav-link ${isActive('/services') ? 'is-active' : ''}`}>Service</Link>
      
      <div className="nav-item">
        <span className={`nav-link nav-link--has-dropdown cursor-default ${isActive('/health-packages') ? 'is-active' : ''}`}>
          Health Package
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
        <div className="nav-dropdown">
          <Link href="/health-packages" className="nav-dropdown__link">Health Packages</Link>
          <Link href="/men-health" className="nav-dropdown__link">Men Health</Link>
          <Link href="/women-health" className="nav-dropdown__link">Women Health</Link>
          <Link href="/lifestyle-health" className="nav-dropdown__link">Lifestyle Health</Link>
        </div>
      </div>

      <div className="nav-item">
        <span className={`nav-link nav-link--has-dropdown cursor-default ${isActive('/tests') ? 'is-active' : ''}`}>
          Tests
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
        <div className="nav-dropdown">
          <Link href="/tests" className="nav-dropdown__link">Tests</Link>
          <Link href="/health-packages" className="nav-dropdown__link">Health Packages</Link>
          <Link href="/services" className="nav-dropdown__link">Diagnostic Services</Link>
        </div>
      </div>

      <Link href="/blog" className={`nav-link ${isActive('/blog') ? 'is-active' : ''}`}>Blog</Link>

      <div className="nav-item">
        <span className={`nav-link nav-link--has-dropdown cursor-default ${isActive('/help') ? 'is-active' : ''}`}>
          Support
          <svg className="nav-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </span>
        <div className="nav-dropdown">
          <Link href="/help" className="nav-dropdown__link">Help & Contact</Link>
        </div>
      </div>
    </div>
  );
}
