'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useRBAC } from '@/hooks/useRBAC';
import { routePermissions, getRoutePermission } from '@/lib/rbac/routePermissions';
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
 *
 * Token expiry recovery:
 *   - If RBAC fails with "Token has expired", silently refresh via Cognito REFRESH_TOKEN_AUTH
 *   - If refresh succeeds → refetch RBAC (no error shown to user)
 *   - If refresh fails → dispatch session_expired → show "Session Expired" screen
 */
export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, authState, refreshSession } = useAuth();
  const { isLoading: rbacLoading, error: rbacError, refetch: refetchRBAC, hasPermission, accessibleModules, isStaff } = useRBAC();
  const router = useRouter();
  const pathname = usePathname();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const isLoading = rbacLoading && authState === 'AUTHENTICATED';


  // Detect token expiry in RBAC errors and silently recover
  React.useEffect(() => {
    if (!rbacError) return;
    const isTokenExpired = rbacError.toLowerCase().includes('token') && rbacError.toLowerCase().includes('expired');
    if (!isTokenExpired) return;
    if (isRefreshing) return;

    setIsRefreshing(true);
    refreshSession().then((ok) => {
      setIsRefreshing(false);
      if (ok) {
        // Refresh succeeded: new token is in sessionStorage; re-run RBAC
        refetchRBAC();
      }
      // If not ok: session_expired event was dispatched → authState becomes SESSION_EXPIRED
    });
  }, [rbacError, isRefreshing, refreshSession, refetchRBAC]);

  React.useEffect(() => {
    if (isLoading) return;

    if (authState === 'UNAUTHENTICATED') {
      router.replace('/login?returnUrl=' + encodeURIComponent(pathname));
      return;
    }

    if (authState === 'AUTHENTICATED') {
      // Not a staff user → public site
      if (!isStaff && !rbacError && !rbacLoading) {
        router.replace('/');
        return;
      }

      // Check route-level permissions if loaded and no error
      if (!rbacError && !rbacLoading) {
        const routePerm = getRoutePermission(pathname);
        if (routePerm) {
          const hasAccess = hasPermission(routePerm.moduleId, routePerm.action);
          if (!hasAccess && accessibleModules.length > 0) {
            // Redirect to first accessible route
            const defaultRoute = getDefaultRoute(accessibleModules);
            if (defaultRoute !== pathname) {
              router.replace(defaultRoute);
            }
          }
        }
      }
    }
  }, [isLoading, authState, user, isStaff, rbacError, rbacLoading, pathname, hasPermission, accessibleModules, router]);

  if (isLoading || isRefreshing) {
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
          <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>
            {isRefreshing ? 'Refreshing session...' : 'Verifying access...'}
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (authState === 'SESSION_EXPIRED') {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0f172a', zIndex: 9999,
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '24px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ color: '#f8fafc', fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>Session Expired</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
            For your security, your session has expired. Please log in again to continue working.
          </p>
          <button 
            onClick={() => router.push('/login?returnUrl=' + encodeURIComponent(pathname))}
            style={{
              background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', 
              borderRadius: '6px', fontWeight: 500, cursor: 'pointer', width: '100%'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Only show the error dialog for non-token-expiry errors that are NOT being refreshed
  const isTokenExpiredError = rbacError?.toLowerCase().includes('token') && rbacError?.toLowerCase().includes('expired');
  if (rbacError && !isTokenExpiredError) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0f172a', zIndex: 9999,
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '24px', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ color: '#f8fafc', fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>Access Error</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
            We encountered a problem loading your permissions. <br/> {rbacError}
          </p>
          <button 
            onClick={() => refetchRBAC()}
            style={{
              background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', 
              borderRadius: '6px', fontWeight: 500, cursor: 'pointer', width: '100%'
            }}
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Don't render children if not fully authorized and no clear error state
  if (authState !== 'AUTHENTICATED' || !isStaff) {
    return null;
  }

  return <>{children}</>;
}

