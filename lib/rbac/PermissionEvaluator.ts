import { ModuleDataModel } from '@/domains/staff/model';

export type PermissionAction = 'view' | 'create' | 'edit' | 'del' | 'assign';

/**
 * Central Permission Evaluator
 * 
 * Generic evaluator that checks permissions from the persisted permission matrix.
 * Does NOT contain role-ID-specific logic or user-specific authorization.
 * 
 * Authorization chain:
 *   UserProfile.staffId → StaffModel → StaffModel.role → Role permissions → This evaluator
 */
export class PermissionEvaluator {
  /**
   * Check if a role has a specific permission on a module.
   * For the 'admin' role, always returns true (immutable full access).
   */
  static hasPermission(
    roleId: string,
    moduleId: string,
    action: PermissionAction,
    permissionsMap: Record<string, ModuleDataModel[]>
  ): boolean {
    if (roleId === 'admin') return true;

    const modules = permissionsMap[roleId];
    if (!modules) return false;

    const mod = modules.find(m => m.id === moduleId);
    if (!mod || !mod.permissions || mod.permissions.length === 0) return false;

    return !!mod.permissions[0][action];
  }

  /**
   * Get all module IDs that a role has 'view' permission for.
   */
  static getAccessibleModules(
    roleId: string,
    permissionsMap: Record<string, ModuleDataModel[]>
  ): string[] {
    if (roleId === 'admin') {
      // Admin has access to all modules in the map, plus standard fallbacks if map is empty/corrupt
      const allModuleIds = new Set<string>([
        'analytics', 'orders', 'collections', 'patients', 'reports',
        'invoices', 'reviews', 'staff', 'blogs', 'settings'
      ]);
      for (const modules of Object.values(permissionsMap)) {
        for (const m of modules) {
          allModuleIds.add(m.id);
        }
      }
      return Array.from(allModuleIds);
    }

    const modules = permissionsMap[roleId];
    if (!modules) return [];

    return modules
      .filter(m => m.permissions && m.permissions.length > 0 && m.permissions[0].view)
      .map(m => m.id);
  }

  /**
   * Check if the role is considered an admin role.
   */
  static isAdmin(roleId: string): boolean {
    return roleId === 'admin';
  }
}
