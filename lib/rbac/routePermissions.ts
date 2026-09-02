import { PermissionAction } from './PermissionEvaluator';

/**
 * Route-to-Module Permission Map
 * 
 * Maps admin routes to the module + action required for access.
 * Used by AdminAuthGuard and AdminSidebar to determine route authorization.
 * 
 * Design: Routes map to modules, modules map to permissions.
 * No role-specific logic here — just "what module does this route need?"
 */
export interface RoutePermission {
  moduleId: string;
  action: PermissionAction;
}

export const routePermissions: Record<string, RoutePermission> = {
  '/admin': { moduleId: 'analytics', action: 'view' },
  '/admin/analytics': { moduleId: 'analytics', action: 'view' },
  '/admin/bookings': { moduleId: 'orders', action: 'view' },
  '/admin/bookings/create': { moduleId: 'orders', action: 'create' },
  '/admin/collections': { moduleId: 'collections', action: 'view' },
  '/admin/patients': { moduleId: 'patients', action: 'view' },
  '/admin/invoices': { moduleId: 'invoices', action: 'view' },
  '/admin/reports': { moduleId: 'reports', action: 'view' },
  '/admin/reviews': { moduleId: 'reviews', action: 'view' },
  '/admin/staff': { moduleId: 'staff', action: 'view' },
  '/admin/blogs': { moduleId: 'blogs', action: 'view' },
  '/admin/newsletter': { moduleId: 'newsletter', action: 'view' },
  '/admin/settings': { moduleId: 'settings', action: 'view' },
  '/admin/catalog': { moduleId: 'catalog', action: 'view' },
};

/**
 * Resolves the required permission for a given pathname, including dynamic routes.
 */
export function getRoutePermission(pathname: string): RoutePermission | undefined {
  // 1. Exact match (fastest)
  if (routePermissions[pathname]) {
    return routePermissions[pathname];
  }

  // 2. Dynamic route match (e.g., /admin/staff/123 -> /admin/staff)
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments[0] === 'admin' && segments.length >= 3) {
    // Reconstruct base path from first two segments
    const baseRoute = `/${segments[0]}/${segments[1]}`;
    return routePermissions[baseRoute];
  }

  return undefined;
}

/**
 * Maps sidebar navigation module IDs to the permission module IDs.
 * Used to filter sidebar items based on the user's accessible modules.
 */
export const sidebarModuleMap: Record<string, string> = {
  '/admin': 'analytics',
  '/admin/analytics': 'analytics',
  '/admin/bookings': 'orders',
  '/admin/collections': 'collections',
  '/admin/patients': 'patients',
  '/admin/invoices': 'invoices',
  '/admin/reports': 'reports',
  '/admin/reviews': 'reviews',
  '/admin/staff': 'staff',
  '/admin/blogs': 'blogs',
  '/admin/newsletter': 'newsletter',
  '/admin/settings': 'settings',
  '/admin/catalog': 'catalog',
};

/**
 * Get the first accessible route for a given set of accessible modules.
 * Used for redirect after login when the default route is not accessible.
 */
export function getDefaultRoute(accessibleModules: string[]): string {
  // Priority order for landing page
  const priorityRoutes: { moduleId: string; route: string }[] = [
    { moduleId: 'analytics', route: '/admin' },
    { moduleId: 'orders', route: '/admin/bookings' },
    { moduleId: 'collections', route: '/admin/collections' },
    { moduleId: 'patients', route: '/admin/patients' },
    { moduleId: 'reports', route: '/admin/reports' },
    { moduleId: 'invoices', route: '/admin/invoices' },
    { moduleId: 'reviews', route: '/admin/reviews' },
    { moduleId: 'catalog', route: '/admin/catalog' },
    { moduleId: 'staff', route: '/admin/staff' },
    { moduleId: 'blogs', route: '/admin/blogs' },
    { moduleId: 'settings', route: '/admin/settings' },
  ];

  for (const entry of priorityRoutes) {
    if (accessibleModules.includes(entry.moduleId)) {
      return entry.route;
    }
  }

  return '/admin/collections'; // Fallback for field agents
}
