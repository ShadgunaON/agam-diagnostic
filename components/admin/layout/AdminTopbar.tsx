'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminIcon } from '../navigation/AdminIcons';
import { AdminButton } from '../primitives/AdminButton';
import { AdminInput } from '../primitives/AdminInput';
import { AdminMobileNav } from '../navigation/AdminMobileNav';

export function AdminTopbar() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    if (pathname?.includes('/bookings')) return 'Bookings';
    if (pathname?.includes('/patients')) return 'Patients';
    if (pathname?.includes('/reports')) return 'Reports';
    if (pathname?.includes('/staff')) return 'Staff & Roles';
    if (pathname?.includes('/tests')) return 'Tests & Packages';
    if (pathname?.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  const getPageSubtitle = () => {
    if (pathname === '/admin') return 'Overview of your key metrics and operations';
    return 'Manage your system operations';
  };

  return (
    <header
      className="bg-white border-b border-[#E5E7EB] flex items-center justify-between shrink-0 sticky top-0 z-20"
      style={{ padding: '12px 24px' }}
    >

      {/* Left: Mobile Nav + Page Title + Subtitle */}
      <div className="flex items-center">
        <AdminMobileNav />
        <div className="flex flex-col justify-center">
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: '1.2' }}>
          {getPageTitle()}
        </h1>
        <p className="hidden sm:block" style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>
          {getPageSubtitle()}
        </p>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center justify-end shrink-0" style={{ gap: '20px' }}>

        {/* Search */}
        <div style={{ width: '480px', height: '52px' }} className="hidden sm:block relative">
          <div
            className="flex items-center w-full h-full bg-white border border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer hover:border-slate-300 transition-colors"
            style={{ borderRadius: '14px', padding: '0 16px' }}
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
              window.dispatchEvent(event);
            }}
          >
            <AdminIcon name="search" className="text-slate-400 shrink-0" style={{ width: '20px', height: '20px' }} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search..."
              readOnly
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-slate-700 placeholder:text-slate-400 cursor-pointer"
              style={{ marginLeft: '12px' }}
            />
            <div className="flex items-center justify-center bg-slate-50 border border-slate-200 shrink-0" style={{ width: '32px', height: '26px', borderRadius: '6px' }}>
              <span className="text-[12px] font-bold text-slate-500">⌘K</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative flex items-center justify-center hover:bg-slate-50 transition-colors" style={{ width: '44px', height: '44px', borderRadius: '12px' }}>
          <AdminIcon name="bell" className="text-slate-500" style={{ width: '22px', height: '22px' }} strokeWidth={2} />
          <span className="absolute bg-red-500 rounded-full ring-2 ring-white" style={{ top: '10px', right: '12px', width: '8px', height: '8px' }}></span>
        </button>

        {/* Separator */}
        <div className="bg-[#E5E7EB]" style={{ width: '1px', height: '24px' }}></div>

        {/* User Profile */}
        <button className="flex items-center hover:bg-slate-50 transition-colors" style={{ borderRadius: '12px', padding: '6px' }}>
          {/* Avatar */}
          <div className="bg-slate-800 flex items-center justify-center shrink-0 shadow-sm" style={{ width: '44px', height: '44px', borderRadius: '12px' }}>
            <span className="text-white text-[14px] font-bold tracking-wider leading-none">AS</span>
          </div>

          {/* Details */}
          <div className="flex flex-col items-start hidden sm:flex justify-center" style={{ marginLeft: '14px', marginRight: '8px' }}>
            <span className="font-semibold text-slate-900 leading-none" style={{ fontSize: '16px', marginBottom: '4px' }}>Admin Staff</span>
            <span className="font-medium text-slate-500 leading-none" style={{ fontSize: '13px' }}>System Manager</span>
          </div>

          {/* Dropdown Indicator */}
          <AdminIcon name="chevronDown" className="text-slate-400" style={{ width: '16px', height: '16px', marginRight: '4px' }} strokeWidth={2.5} />
        </button>

      </div>
    </header>
  );
}
