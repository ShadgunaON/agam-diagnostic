'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminIcon, AdminIconName } from './AdminIcons';

type Role = 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PHLEBOTOMIST';

interface NavigationItem {
  title: string;
  href: string;
  icon: AdminIconName;
  roles: Role[];
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

const adminNavigation: NavigationGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/admin', icon: 'layoutDashboard', roles: ['ADMIN', 'DOCTOR', 'STAFF'] },
      { title: 'Analytics', href: '/admin/analytics', icon: 'barChart', roles: ['ADMIN'] },
    ]
  },
  {
    title: 'Operations',
    items: [
      { title: 'Bookings', href: '/admin/bookings', icon: 'calendar', roles: ['ADMIN', 'STAFF', 'PHLEBOTOMIST'] },
      { title: 'Home Collections', href: '/admin/collections', icon: 'mapPin', roles: ['ADMIN', 'STAFF', 'PHLEBOTOMIST'] },
      { title: 'Patients', href: '/admin/patients', icon: 'users', roles: ['ADMIN', 'DOCTOR', 'STAFF'] },
      { title: 'Reports', href: '/admin/reports', icon: 'file', roles: ['ADMIN', 'DOCTOR', 'STAFF'] },
    ]
  },
  {
    title: 'Management',
    items: [
      { title: 'Staff & Roles', href: '/admin/staff', icon: 'userCog', roles: ['ADMIN'] },
      { title: 'Tests & Packages', href: '/admin/catalog', icon: 'testTube', roles: ['ADMIN', 'DOCTOR'] },
      { title: 'Inventory', href: '/admin/inventory', icon: 'box', roles: ['ADMIN', 'STAFF'] },
    ]
  },
  {
    title: 'System',
    items: [
      { title: 'Settings', href: '/admin/settings', icon: 'settings', roles: ['ADMIN'] },
    ]
  }
];

export function AdminSidebar({ isCollapsed = false, setIsCollapsed = () => {} }: { isCollapsed?: boolean, setIsCollapsed?: (val: boolean) => void }) {
  const pathname = usePathname();

  // Mock role for now - replace with actual auth state later
  const userRole: Role = 'ADMIN';

  const hasPermission = (userRole: Role, allowedRoles: Role[]) => {
    return allowedRoles.includes(userRole);
  };

  return (
    <aside
      style={{ width: isCollapsed ? 80 : 210, flexShrink: 0, position: 'relative', display: 'flex' }}
      className="hidden lg:flex bg-[#1A2234] border-r border-[#26314A] flex-col transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-40"
    >
      <div
        className="flex items-center justify-between shrink-0"
        style={{ height: '76px', padding: '0 24px', marginBottom: '16px', marginTop: '8px' }}
      >
        {!isCollapsed && (
          <Link href="/admin" className="flex items-center !text-white hover:opacity-80 transition-opacity" style={{ gap: '12px' }}>
            <div className="bg-gradient-to-br from-[#e31837] to-[#b9112a] flex items-center justify-center shrink-0 shadow-lg shadow-red-900/20" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
              <AdminIcon name="microscope" className="text-white" style={{ width: '20px', height: '20px' }} />
            </div>
            <span className="font-bold tracking-tight whitespace-nowrap" style={{ fontSize: '15px' }}>AGAM Admin</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute bg-white border border-slate-200 flex items-center justify-center shadow-sm text-slate-400 hover:text-slate-700 z-50"
          style={{ right: '-12px', top: '24px', width: '24px', height: '24px', borderRadius: '50%' }}
        >
          <AdminIcon name={isCollapsed ? "chevronRight" : "chevronDown"} style={{ width: '14px', height: '14px' }} />
        </button>
      </div>

      <div
        className="flex-1 flex flex-col"
        style={{ padding: '8px 12px 12px 12px', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {adminNavigation.map((group) => {
          const visibleItems = group.items.filter(item => hasPermission(userRole as Role, item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="flex flex-col" style={{ marginBottom: '16px' }}>
              {!isCollapsed && (
                <div className="font-bold !text-slate-400 uppercase tracking-[0.16em]" style={{ fontSize: '11px', padding: '0 12px', marginBottom: '8px' }}>
                  {group.title}
                </div>
              )}
              <div className="flex flex-col" style={{ gap: '4px' }}>
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center transition-all duration-200 group relative ${isActive
                          ? 'bg-blue-500/20 !text-blue-300'
                          : '!text-slate-300 hover:bg-white/10 hover:!text-white'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.title : undefined}
                      style={{
                        padding: isCollapsed ? '10px 0' : '10px 14px',
                        borderRadius: '10px',
                        gap: '14px'
                      }}
                    >
                      {isActive && !isCollapsed && (
                        <div className="absolute bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" style={{ left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '20px', borderTopRightRadius: '9999px', borderBottomRightRadius: '9999px' }} />
                      )}

                      <AdminIcon
                        name={item.icon}
                        className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                        style={{ width: '18px', height: '18px' }}
                        strokeWidth={isActive ? 2.5 : 2}
                      />

                      {!isCollapsed && (
                        <span className={`leading-none tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`} style={{ fontSize: '14px' }}>
                          {item.title}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Section (Bottom) */}
      <div className="shrink-0 mt-auto border-t border-white/5" style={{ padding: '16px' }}>
        <button className={`w-full flex items-center hover:bg-white/5 transition-colors group ${isCollapsed ? 'justify-center' : ''}`} style={{ padding: '8px', borderRadius: '12px', gap: '16px' }}>
          <div className="bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700" style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
            <span className="text-slate-300 text-sm font-medium">AS</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 flex flex-col items-start min-w-0">
              <span className="font-medium !text-white truncate w-full text-left" style={{ fontSize: '14px' }}>Admin Staff</span>
              <span className="!text-slate-500 truncate w-full text-left" style={{ fontSize: '12px' }}>View Profile</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
