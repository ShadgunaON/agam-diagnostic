"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Navbar } from './Navbar';
import { MobileNavigation } from './MobileNavigation';
import { Container } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { GlobalSearch } from '@/components/common/GlobalSearch';

export interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, clearCart } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className={`nav-top ${className}`.trim()}>
        <Container className="flex flex-wrap md:flex-nowrap justify-center lg:justify-between items-center w-full gap-2 md:gap-0">
          <div className="nav-top__left flex flex-wrap justify-center lg:justify-start items-center w-full md:w-auto">
            <div className="nav-top__item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              <a href="tel:+918940894079">+91 89408 94079</a>
            </div>
            <div className="nav-top__item hidden md:flex">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <a href="mailto:support@agamdiagnostics.com">support@agamdiagnostics.com</a>
            </div>
          </div>
          <div className="nav-top__right hidden md:flex items-center">
            <div className="nav-top__item">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              NABL Accredited
            </div>
            <a href="#" className="nav-top__action" style={{ opacity: 0.5, cursor: 'not-allowed', textDecoration: 'none' }} title="Temporarily Unavailable">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download Reports
            </a>
          </div>
        </Container>
      </div>

      <nav className="nav-main sticky top-0 z-[1000] min-h-[60px] md:static md:min-h-auto" id="nav-main">
        <Container className="flex justify-between items-center w-full">
          <Link href="/" className="nav-logo shrink-0">
            <img loading="lazy" src="https://www.agamdiagnostics.com/wp-content/uploads/2023/08/agam-site-logo.webp" alt="Agam Diagnostics" width="184" height="63" className="w-[130px] sm:w-[184px] h-auto" />
          </Link>
          
          <Navbar />
          
          <div id="nav-auth-section" className="flex items-center gap-1 sm:gap-3">
            
            {/* Search Icon Trigger */}
            <button
              type="button"
              className="p-1.5 sm:p-2 text-foreground hover:bg-bg-alt rounded-full transition-colors cursor-pointer border-none bg-transparent"
              onClick={() => setIsSearchOpen(true)}
              title="Search Tests & Packages"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {/* Cart Icon Trigger */}
            <Link 
              href="/book"
              className="btn btn--outline btn--sm cursor-pointer !px-2 sm:!px-3 !py-1.5 sm:!py-2 flex items-center gap-1 sm:gap-2 !bg-transparent !border-primary !text-primary no-underline" 
              title="View Booking Cart"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span className="bg-accent text-white rounded-full w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] inline-flex items-center justify-center text-[10px] sm:text-[11px] font-bold">
                {itemCount}
              </span>
            </Link>

            {/* Auth Menu / User Greeting */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  className="flex items-center gap-1 sm:gap-2 text-sm font-semibold text-primary bg-bg-alt hover:bg-muted/40 px-2 sm:px-3 py-1.5 rounded-full border border-border transition-all cursor-pointer"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-white text-[10px] sm:text-xs font-bold flex items-center justify-center uppercase">
                    {user.fullName ? user.fullName.charAt(0) : 'P'}
                  </span>
                  <span className="hidden sm:inline-block max-w-[100px] truncate">{user.fullName ? user.fullName.split(' ')[0] : 'Patient'}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 sm:w-3.5 h-3 sm:h-3.5">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="user-menu-dropdown animate-in fade-in zoom-in-95">
                    <div className="user-menu-dropdown__header">
                      <p className="user-menu-dropdown__name">{user.fullName || 'Agam Patient'}</p>
                      <p className="user-menu-dropdown__phone">+91 {user.mobile}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="user-menu-dropdown__link"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/bookings"
                      className="user-menu-dropdown__link"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Bookings
                    </Link>
                    {(user.role === 'admin' || user.role === 'doctor' || user.role === 'lab_tech') && (
                      <Link
                        href="/admin/bookings"
                        className="user-menu-dropdown__link text-primary font-bold bg-blue-50/50 hover:bg-blue-100/50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                        style={{ borderLeft: '3px solid var(--color-primary)' }}
                      >
                        Admin Portal →
                      </Link>
                    )}
                    <Link
                      href="/reports"
                      className="user-menu-dropdown__link"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Reports
                    </Link>
                    <button
                      type="button"
                      className="user-menu-dropdown__btn"
                      onClick={() => {
                        clearCart();
                        logout();
                        setShowUserMenu(false);
                        router.push('/');
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="text-[10px] sm:text-xs font-bold text-primary hover:underline px-1.5 sm:px-2.5 py-1.5 rounded-md hover:bg-bg-alt transition-colors no-underline whitespace-nowrap"
              >
                Sign In <span className="hidden sm:inline">/ Register</span>
              </Link>
            )}

            {/* Make Appointment CTA */}
            <Button href="/book" className="btn btn--primary btn--sm nav-cta !hidden lg:!inline-flex">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Make Appointment
            </Button>
            
            <MobileNavigation />
          </div>
        </Container>
      </nav>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
