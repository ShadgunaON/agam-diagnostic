'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useRBAC } from '@/hooks/useRBAC';
import { routePermissions } from '@/lib/rbac/routePermissions';
import { getDefaultRoute } from '@/lib/rbac/routePermissions';

/**
 * AdminAuthGuard
 * 
 * Enforces authentication + authorization for the admin panel.
 * 
 * Authentication: User must be logged in with a staff role.
 * Authorization: User's role must have 'view' permission on the route's module.
 * 
 * Redirect logic:
 *   - Not authenticated → /login
 *   - Authenticated but no admin/staff role → / (public site)
 *   - Authenticated staff but no permission for this route → first accessible route
 */
export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoading: rbacLoading, hasPermission, accessibleModules, isStaff } = useRBAC();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = authLoading || rbacLoading;

  React.useEffect(() => {
    if (isLoading) return;

    // Gate 1: Not authenticated → login
    if (!isAuthenticated || !user) {
      router.replace('/login?returnUrl=' + encodeURIComponent(pathname));
      return;
    }

    // Gate 2: Not a staff user → public site
    if (!isStaff) {
      router.replace('/');
      return;
    }

    // Gate 3: Check route-level permissions
    const routePerm = routePermissions[pathname];
    if (routePerm) {
      const hasAccess = hasPermission(routePerm.moduleId, routePerm.action);
      if (!hasAccess) {
        // Redirect to first accessible route
        const defaultRoute = getDefaultRoute(accessibleModules);
        if (defaultRoute !== pathname) {
          router.replace(defaultRoute);
        }
      }
    }
    // If no routePermission mapping exists, allow access (page handles its own checks)
  }, [isLoading, isAuthenticated, user, isStaff, pathname, hasPermission, accessibleModules, router]);

  // Show loading state while auth/RBAC resolves
  if (isLoading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0f172a', zIndex: 9999,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto',
          }} />
          <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>Verifying access...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Don't render children if not authorized
  if (!isAuthenticated || !isStaff) {
    return null;
  }

  return <>{children}</>;
}
