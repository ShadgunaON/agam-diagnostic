'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminIcon } from './AdminIcons';
import { Drawer } from '@/components/ui/Drawer';

type Role = 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PHLEBOTOMIST';

const adminNavigation = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/admin', icon: 'dashboard' as const, roles: ['ADMIN', 'DOCTOR', 'STAFF'] },
      { title: 'Analytics', href: '/admin/analytics', icon: 'chart' as const, roles: ['ADMIN'] },
    ]
  },
  {
    title: 'Operations',
    items: [
      { title: 'Bookings', href: '/admin/bookings', icon: 'calendar' as const, roles: ['ADMIN', 'STAFF', 'PHLEBOTOMIST'] },
      { title: 'Home Collections', href: '/admin/collections', icon: 'mapPin' as const, roles: ['ADMIN', 'STAFF', 'PHLEBOTOMIST'] },
      { title: 'Patients', href: '/admin/patients', icon: 'users' as const, roles: ['ADMIN', 'DOCTOR', 'STAFF'] },
      { title: 'Reports', href: '/admin/reports', icon: 'file' as const, roles: ['ADMIN', 'DOCTOR', 'STAFF'] },
    ]
  },
  {
    title: 'Management',
    items: [
      { title: 'Staff & Roles', href: '/admin/staff', icon: 'userCog' as const, roles: ['ADMIN'] },
      { title: 'Content / Blogs', href: '/admin/blogs', icon: 'fileText' as const, roles: ['ADMIN'] },
    ]
  },
  {
    title: 'System',
    items: [
      { title: 'Settings', href: '/admin/settings', icon: 'settings' as const, roles: ['ADMIN'] },
    ]
  }
];

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Mock role for now
  const userRole: Role = 'ADMIN';

  const hasPermission = (userRole: Role, allowedRoles: string[]) => {
    return allowedRoles.includes(userRole);
  };

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
      
      <Drawer.Content side="left" className="p-0 bg-[#1A2234] border-r border-[#26314A] w-[280px]">
        <div className="flex items-center justify-between p-6 border-b border-[#26314A]">
          <Link href="/admin" className="flex items-center text-white gap-3" onClick={closeMenu}>
            <div className="bg-gradient-to-br from-[#e31837] to-[#b9112a] flex items-center justify-center shrink-0 shadow-lg" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
              <AdminIcon name="microscope" className="text-white w-[18px] h-[18px]" />
            </div>
            <span className="font-bold tracking-tight text-[16px]">AGAM Admin</span>
          </Link>
          <Drawer.Close className="text-slate-400 hover:text-white transition-colors bg-transparent border-none">
            <AdminIcon name="x" className="w-5 h-5" />
          </Drawer.Close>
        </div>
        
        <Drawer.Body className="p-4 bg-[#1A2234] flex-1 overflow-y-auto">
          {adminNavigation.map((group) => {
            const visibleItems = group.items.filter(item => hasPermission(userRole, item.roles));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="mb-6">
                <div className="font-bold text-slate-400 uppercase tracking-widest text-[11px] mb-3 px-3">
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
                            ? 'bg-blue-500/20 text-blue-300 font-semibold relative' 
                            : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] rounded-r-full" />
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
        <div className="px-6 py-4 border-t border-[#26314A] mt-auto shrink-0 bg-[#1A2234]">
          <Link 
            href="/" 
            className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#26314A] transition-colors group w-full border border-[#26314A]"
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
