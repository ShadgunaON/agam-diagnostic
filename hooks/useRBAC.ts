'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { staffService } from '@/services';
import { StaffModel, RoleModel, ModuleDataModel } from '@/domains/staff/model';
import { PermissionEvaluator, PermissionAction } from '@/lib/rbac/PermissionEvaluator';

export interface RBACState {
  /** Whether RBAC data is still loading */
  isLoading: boolean;
  /** Error message if RBAC failed to load */
  error: string | null;
  /** The resolved StaffModel (null if not a staff user) */
  staff: StaffModel | null;
  /** The resolved RoleModel (null if not a staff user) */
  role: RoleModel | null;
  /** Full permissions map for all roles */
  permissionsMap: Record<string, ModuleDataModel[]>;
  /** Operational scope from the role (e.g. 'home_collection', 'in_lab') */
  scope: string | undefined;
  /** Check if the current user has a specific permission */
  hasPermission: (moduleId: string, action: PermissionAction) => boolean;
  /** Get all module IDs the user can access */
  accessibleModules: string[];
  /** Whether the user is a system admin */
  isAdmin: boolean;
  /** Whether the user is any staff role (admin, op, path, phleb, etc.) */
  isStaff: boolean;
  /** Manually trigger a reload of roles and permissions */
  refetch: () => Promise<void>;
}

/**
 * Hook: useRBAC
 * 
 * Bridges the authenticated session to the RBAC permission system.
 * 
 * Authorization chain:
 *   useAuth().user.staffId → StaffService.getStaffById() → StaffModel.role
 *   → StaffService.getAllPermissionsMap() → PermissionEvaluator
 * 
 * This hook does NOT contain role-ID-specific authorization logic.
 */
export function useRBAC(): RBACState {
  const { user, authState } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staff, setStaff] = useState<StaffModel | null>(null);
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [permissionsMap, setPermissionsMap] = useState<Record<string, ModuleDataModel[]>>({});

  const loadRBACData = useCallback(async () => {
    // If not authenticated or session expired, don't attempt to fetch
    if (authState === 'UNAUTHENTICATED' || authState === 'SESSION_EXPIRED') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Always load roles and permissions for admin sidebar filtering
      const [rolesRes, permsRes] = await Promise.all([
        staffService.getAllRoles(),
        staffService.getAllPermissionsMap(),
      ]);

      if (rolesRes.isFailure) {
        setError(rolesRes.error?.message || 'Failed to fetch roles');
      } else if (permsRes.isFailure) {
        setError(permsRes.error?.message || 'Failed to fetch permissions');
      } else {
        setRoles(rolesRes.value);
        setPermissionsMap(permsRes.value);
      }

      // Resolve staff from user session
      if (user?.staffId) {
        const staffRes = await staffService.getStaffById(user.staffId);
        if (staffRes.isSuccess) {
          setStaff(staffRes.value);
        } else if (staffRes.isFailure) {
          const errorName = staffRes.error?.name || '';
          const errMsg = staffRes.error?.message || 'Failed to fetch staff';
          
          // Gracefully handle missing staff profile (e.g. 404 Not Found)
          if (errorName === 'NotFoundError' || errMsg.includes('404') || errMsg.toLowerCase().includes('not found')) {
            setStaff(null);
          } else {
            setError(prev => prev ? `${prev} | ${errMsg}` : errMsg);
          }
        }
      } else if (user?.role === 'admin') {
        // Admin users without explicit staffId still get full access
        setStaff(null);
      } else {
        setStaff(null);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred loading RBAC');
    } finally {
      setIsLoading(false);
    }
  }, [user, authState]);

  useEffect(() => {
    let cancelled = false;
    
    // Using an IIFE to handle the promise inside useEffect while respecting cancellation
    (async () => {
      await loadRBACData();
      if (cancelled) return;
    })();

    return () => { cancelled = true; };
  }, [loadRBACData]);

  // Derive the role from either the staff record or the user session
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const role = useMemo<RoleModel | null>(() => {
    if (staff) {
      // Staff's role field maps to a RoleModel.id (or sometimes accidentally the title)
      const staffRoleId = staff.role.toLowerCase();
      return roles.find(r => r.id === staffRoleId || r.title.toLowerCase() === staffRoleId) || null;
    }
    // Fallback for users without staffId (e.g. manually assigned roles in DB)
    if (user?.role) {
      const userRoleId = user.role.toLowerCase();
      const matchedRole = roles.find(r => r.id === userRoleId || r.title.toLowerCase() === userRoleId);
      if (matchedRole) return matchedRole;
    }
    return null;
  }, [staff, roles, user?.role]);

  const roleId = role?.id || (user?.role === 'admin' ? 'admin' : '');

  const hasPermission = useCallback(
    (moduleId: string, action: PermissionAction): boolean => {
      if (!roleId) return false;
      return PermissionEvaluator.hasPermission(roleId, moduleId, action, permissionsMap);
    },
    [roleId, permissionsMap]
  );

  const accessibleModules = useMemo(() => {
    if (!roleId) return [];
    const modules = PermissionEvaluator.getAccessibleModules(roleId, permissionsMap);
    return modules;
  }, [roleId, permissionsMap]);

  const isAdmin = useMemo(() => {
    if (user?.role === 'admin') return true;
    return roleId ? PermissionEvaluator.isAdmin(roleId) : false;
  }, [roleId, user?.role]);

  const isStaff = !!(staff || (user?.role && user.role !== 'patient'));

  const scope = role?.scope;

  return {
    isLoading,
    error,
    staff,
    role,
    permissionsMap,
    scope,
    hasPermission,
    accessibleModules,
    isAdmin,
    isStaff,
    refetch: loadRBACData,
  };
}
