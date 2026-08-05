import { Role } from '../lib/auth/permissions';

export interface AdminNavItem {
  title: string;
  href: string;
  icon: string; // Key corresponding to AdminIcons
  roles?: Role[]; // If undefined, available to all admin portal users
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const adminNavigation: AdminNavGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/admin', icon: 'dashboard' },
      { title: 'Analytics', href: '/admin/analytics', icon: 'chart', roles: ['admin'] },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Bookings', href: '/admin/bookings', icon: 'calendar' },
      { title: 'Patients', href: '/admin/patients', icon: 'users' },
      { title: 'Reports', href: '/admin/reports', icon: 'fileText' },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { title: 'Tests', href: '/admin/tests', icon: 'testTube', roles: ['admin'] },
      { title: 'Packages', href: '/admin/packages', icon: 'package', roles: ['admin'] },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Staff', href: '/admin/staff', icon: 'badge', roles: ['admin'] },
      { title: 'Settings', href: '/admin/settings', icon: 'settings', roles: ['admin'] },
    ],
  }
];
