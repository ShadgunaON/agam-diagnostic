/**
 * RBAC Module - Barrel Export
 * 
 * Centralizes all RBAC-related exports for clean imports:
 *   import { PermissionEvaluator, routePermissions } from '@/lib/rbac';
 */

export { PermissionEvaluator } from './PermissionEvaluator';
export type { PermissionAction } from './PermissionEvaluator';

export { routePermissions, sidebarModuleMap, getDefaultRoute } from './routePermissions';
export type { RoutePermission } from './routePermissions';
