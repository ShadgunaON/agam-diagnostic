'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminIcon } from '../navigation/AdminIcons';
import { AdminButton } from '../primitives/AdminButton';
import { AdminInput } from '../primitives/AdminInput';
import { AdminMobileNav } from '../navigation/AdminMobileNav';
import { useAuth } from '@/context/AuthContext';
import { useRBAC } from '@/hooks/useRBAC';

export function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { role } = useRBAC();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const notifRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!user) return;
    import('@/services').then(({ notificationService }) => {
      const recipientId = user.staffId || user.id;
      notificationService.getMyNotifications(recipientId).then(res => {
        if (res.isSuccess) {
          setNotifications(res.value);
        }
      });
    });
  }, [user, showNotifDropdown]); // Refresh when dropdown opens

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string, link?: string) => {
    const { notificationService } = await import('@/services');
    await notificationService.markAsRead(id);
    if (link) router.push(link);
    setShowNotifDropdown(false);
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'ST';

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
        <p className="admin-hide-mobile" style={{ fontSize: '16px', fontWeight: 500, color: '#64748b' }}>
          {getPageSubtitle()}
        </p>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center justify-end shrink-0" style={{ gap: '20px' }}>

        {/* Search */}
        <div style={{ width: '480px', height: '52px' }} className="admin-hide-mobile relative">
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
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent outline-none" 
            style={{ width: '44px', height: '44px', borderRadius: '12px' }}
          >
            <AdminIcon name="bell" className="text-slate-500" style={{ width: '22px', height: '22px' }} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center" style={{ top: '6px', right: '8px', width: '16px', height: '16px', fontSize: '10px', color: 'white', fontWeight: 'bold' }}>
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
              <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm m-0">Notifications</h3>
                {unreadCount > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleMarkAsRead(n.id, n.link)}
                      className={`p-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                    >
                      <p className="text-sm font-bold text-slate-900 mb-1">{n.title}</p>
                      <p className="text-xs text-slate-600 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">
                        {new Date(n.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="bg-[#E5E7EB]" style={{ width: '1px', height: '24px' }}></div>

        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button 
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent outline-none" 
            style={{ borderRadius: '12px', padding: '6px' }}
          >
            {/* Avatar */}
            <div className="bg-slate-800 flex items-center justify-center shrink-0 shadow-sm" style={{ width: '44px', height: '44px', borderRadius: '12px' }}>
              <span className="text-white text-[14px] font-bold tracking-wider leading-none">{initials}</span>
            </div>

            {/* Details */}
            <div className="admin-hide-mobile flex-col items-start justify-center" style={{ display: 'flex', marginLeft: '14px', marginRight: '8px' }}>
              <span className="font-semibold text-slate-900 leading-none" style={{ fontSize: '16px', marginBottom: '4px' }}>{user?.fullName || 'Staff'}</span>
              <span className="font-medium text-slate-500 leading-none" style={{ fontSize: '13px' }}>{role?.title || 'Staff'}</span>
            </div>

            {/* Dropdown Indicator */}
            <AdminIcon name="chevronDown" className="text-slate-400" style={{ width: '16px', height: '16px', marginRight: '4px' }} strokeWidth={2.5} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
              <div className="p-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName || 'Staff'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || role?.title || 'Staff Member'}</p>
              </div>
              <div className="p-2">
                <Link 
                  href="/admin/profile" 
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors no-underline"
                  onClick={() => setShowDropdown(false)}
                >
                  <AdminIcon name="user" className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>
                <button 
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                    window.location.href = '/';
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer outline-none mt-1"
                >
                  <AdminIcon name="logOut" className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
