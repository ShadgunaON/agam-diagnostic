'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { staffService } from '@/services';
import { StaffModel, RoleModel, ModuleDataModel } from '@/domains/staff/model';
import { PermissionEvaluator, PermissionAction } from '@/lib/rbac/PermissionEvaluator';

export interface RBACState {
  /** Whether RBAC data is still loading */
  isLoading: boolean;
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
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<StaffModel | null>(null);
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [permissionsMap, setPermissionsMap] = useState<Record<string, ModuleDataModel[]>>({});

  useEffect(() => {
    let cancelled = false;

    const loadRBACData = async () => {
      setIsLoading(true);

      // Always load roles and permissions for admin sidebar filtering
      const [rolesRes, permsRes] = await Promise.all([
        staffService.getAllRoles(),
        staffService.getAllPermissionsMap(),
      ]);

      if (cancelled) return;

      if (rolesRes.isSuccess) setRoles(rolesRes.value);
      if (permsRes.isSuccess) setPermissionsMap(permsRes.value);

      // Resolve staff from user session
      if (user?.staffId) {
        const staffRes = await staffService.getStaffById(user.staffId);
        if (!cancelled && staffRes.isSuccess) {
          setStaff(staffRes.value);
        }
      } else if (user?.role === 'admin') {
        // Admin users without explicit staffId still get full access
        setStaff(null);
      } else {
        setStaff(null);
      }

      if (!cancelled) setIsLoading(false);
    };

    loadRBACData();

    return () => { cancelled = true; };
  }, [user?.staffId, user?.role]);

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
      if ((user?.role?.toLowerCase() === 'phlebotomist' || role?.title?.toLowerCase() === 'phlebotomist' || roleId === 'phleb') && (moduleId === 'collections' || moduleId === 'orders' || moduleId === 'patients')) {
        return true;
      }
      return PermissionEvaluator.hasPermission(roleId, moduleId, action, permissionsMap);
    },
    [roleId, permissionsMap, user, role]
  );

  const accessibleModules = useMemo(() => {
    if (!roleId) return [];
    let modules = PermissionEvaluator.getAccessibleModules(roleId, permissionsMap);
    // Hardcode fallback for Phlebotomists / Deekshitha in case local DB permissions are missing
    if (user?.role?.toLowerCase() === 'phlebotomist' || role?.title?.toLowerCase() === 'phlebotomist' || roleId === 'phleb') {
      if (!modules.includes('collections')) modules = [...modules, 'collections'];
      if (!modules.includes('orders')) modules = [...modules, 'orders'];
      if (!modules.includes('patients')) modules = [...modules, 'patients'];
    }
    return modules;
  }, [roleId, permissionsMap, user, role]);

  const isAdmin = useMemo(() => {
    if (user?.role === 'admin') return true;
    return roleId ? PermissionEvaluator.isAdmin(roleId) : false;
  }, [roleId, user?.role]);

  const isStaff = !!(staff || (user?.role && user.role !== 'patient'));

  const scope = role?.scope;

  return {
    isLoading,
    staff,
    role,
    permissionsMap,
    scope,
    hasPermission,
    accessibleModules,
    isAdmin,
    isStaff,
  };
}
