'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminIcon } from './AdminIcons';
import { Drawer } from '@/components/ui/Drawer';

import { useRBAC } from '@/hooks/useRBAC';

interface NavigationItem {
  title: string;
  href: string;
  icon: any;
  moduleId: string;
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

const adminNavigation: NavigationGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/admin', icon: 'dashboard', moduleId: 'analytics' },
      { title: 'Analytics', href: '/admin/analytics', icon: 'chart', moduleId: 'analytics' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { title: 'Bookings', href: '/admin/bookings', icon: 'calendar', moduleId: 'orders' },
      { title: 'Collections', href: '/admin/collections', icon: 'mapPin', moduleId: 'collections' },
      { title: 'Patients', href: '/admin/patients', icon: 'users', moduleId: 'patients' },
      { title: 'Ledger & Invoices', href: '/admin/invoices', icon: 'fileText', moduleId: 'invoices' },
      { title: 'Reports', href: '/admin/reports', icon: 'file', moduleId: 'reports' },
      { title: 'Reviews', href: '/admin/reviews', icon: 'fileText', moduleId: 'reviews' },
    ]
  },
  {
    title: 'Management',
    items: [
      { title: 'Staff & Roles', href: '/admin/staff', icon: 'userCog', moduleId: 'staff' },
      { title: 'Content / Blogs', href: '/admin/blogs', icon: 'fileText', moduleId: 'blogs' },
      { title: 'Newsletter', href: '/admin/newsletter', icon: 'mail', moduleId: 'newsletter' },
    ]
  }
];

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { accessibleModules, isLoading } = useRBAC();

  const closeMenu = () => setIsOpen(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Trigger asChild>
        <button 
          className="admin-mobile-trigger p-2 mr-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border-none bg-transparent flex items-center justify-center shrink-0"
          aria-label="Open Admin Menu"
        >
          <AdminIcon name="menu" className="w-6 h-6" />
        </button>
      </Drawer.Trigger>
      
      <Drawer.Content side="left" className="p-0 bg-white border-r border-slate-200 w-[280px]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <Link href="/admin" className="flex items-center text-slate-900 gap-3" onClick={closeMenu}>
            <div className="bg-gradient-to-br from-[#e31837] to-[#b9112a] flex items-center justify-center shrink-0 shadow-lg" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
              <AdminIcon name="microscope" className="text-white w-[18px] h-[18px]" />
            </div>
            <span className="font-bold tracking-tight text-[16px]">AGAM Admin</span>
          </Link>
          <Drawer.Close className="text-slate-400 hover:text-slate-800 transition-colors bg-transparent border-none">
            <AdminIcon name="x" className="w-5 h-5" />
          </Drawer.Close>
        </div>
        
        <Drawer.Body className="p-4 bg-white flex-1 overflow-y-auto">
          {adminNavigation.map((group) => {
            const visibleItems = isLoading
              ? []
              : group.items.filter(item => accessibleModules.includes(item.moduleId));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="mb-6">
                <div className="font-bold text-slate-500 uppercase tracking-widest text-[11px] mb-3 px-3">
                  {group.title}
                </div>
                <div className="flex flex-col gap-1">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-50 text-blue-600 font-semibold relative' 
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)] rounded-r-full" />
                        )}
                        <AdminIcon 
                          name={item.icon} 
                          className={`w-[18px] h-[18px] ${isActive ? 'scale-110' : ''}`}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span className="text-[14px] leading-none tracking-wide">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </Drawer.Body>
        
        {/* Public Site Navigation */}
        <div className="px-6 py-4 border-t border-slate-200 mt-auto shrink-0 bg-slate-50">
          <Link 
            href="/" 
            className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors group w-full border border-slate-200"
            onClick={closeMenu}
          >
            <span className="font-semibold text-[14px]">View Public Site</span>
            <AdminIcon name="chevronRight" className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
          </Link>
        </div>
      </Drawer.Content>
    </Drawer>
  );
}
