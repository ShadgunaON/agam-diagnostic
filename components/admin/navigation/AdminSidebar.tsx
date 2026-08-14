'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminIcon, AdminIconName } from './AdminIcons';
import { useRBAC } from '@/hooks/useRBAC';
import { useAuth } from '@/context/AuthContext';
import { sidebarModuleMap } from '@/lib/rbac/routePermissions';

interface NavigationItem {
  title: string;
  href: string;
  icon: AdminIconName;
  /** The RBAC module ID required to view this item */
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
      { title: 'Dashboard', href: '/admin', icon: 'layoutDashboard', moduleId: 'analytics' },
      { title: 'Analytics', href: '/admin/analytics', icon: 'barChart', moduleId: 'analytics' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { title: 'Bookings', href: '/admin/bookings', icon: 'calendar', moduleId: 'orders' },
      { title: 'Home Collections', href: '/admin/collections', icon: 'mapPin', moduleId: 'collections' },
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
      { title: 'Newsletter', href: '/admin/newsletter', icon: 'mail', moduleId: 'blogs' },
    ]
  },
  {
    title: 'System',
    items: [
      { title: 'Settings', href: '/admin/settings', icon: 'settings', moduleId: 'settings' },
    ]
  }
];

export function AdminSidebar({ isCollapsed = false, setIsCollapsed = () => {} }: { isCollapsed?: boolean, setIsCollapsed?: (val: boolean) => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { accessibleModules, role, isLoading, isAdmin } = useRBAC();

  return (
    <aside
      style={{ width: isCollapsed ? 80 : 210, flexShrink: 0, position: 'relative', display: 'flex' }}
      className="admin-sidebar-desktop bg-[#1A2234] border-r border-[#26314A] flex-col transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-40"
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
          // Filter items by RBAC accessible modules
          const visibleItems = isLoading
            ? [] // Don't show items while loading
            : group.items.filter(item => isAdmin || accessibleModules.includes(item.moduleId));
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

      {/* Public Site Navigation */}
      <div className="px-6 py-4 border-t border-slate-700/50">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors group w-full border border-slate-700 hover:border-slate-600"
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', borderRadius: '8px', color: '#cbd5e1', border: '1px solid #334155', textDecoration: 'none', transition: 'all 0.2s', backgroundColor: 'rgba(51, 65, 85, 0.2)' }}
        >
          <AdminIcon name="chevronRight" className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" strokeWidth={2} style={{ width: '20px', height: '20px', transform: 'rotate(180deg)' }} />
          <span className="font-semibold text-[14px]">View Public Site</span>
        </Link>
      </div>

      {/* Profile Section (Bottom) */}
      <div className="shrink-0 mt-auto border-t border-white/5" style={{ padding: '16px' }}>
        <button 
          onClick={logout}
          className={`w-full flex items-center hover:bg-white/5 transition-colors group ${isCollapsed ? 'justify-center' : ''}`} 
          style={{ padding: '8px', borderRadius: '12px', gap: '16px' }}
        >
          <div className="bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700" style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
            <span className="text-slate-300 text-sm font-medium">
              {user?.fullName?.substring(0, 2).toUpperCase() || 'ST'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 flex flex-col items-start min-w-0">
              <span className="font-medium !text-white truncate w-full text-left" style={{ fontSize: '14px' }}>
                {user?.fullName || 'Staff'}
              </span>
              <span className="!text-slate-500 truncate w-full text-left" style={{ fontSize: '12px' }}>
                {role?.title || user?.role || 'Staff'}
              </span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
