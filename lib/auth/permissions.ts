export type Role = 'admin' | 'staff' | 'user';

export const RoleHierarchy: Record<Role, number> = {
  admin: 3,
  staff: 2,
  user: 1,
};

/**
 * Validates if the given user role is authorized against the required roles.
 * @param userRole The role of the current user.
 * @param requiredRoles An array of allowed roles. If empty or undefined, access is granted.
 */
export function hasPermission(userRole: Role | undefined, requiredRoles?: Role[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No specific roles required
  }

  if (!userRole) {
    return false; // User has no role but roles are required
  }

  // Exact match inclusion
  if (requiredRoles.includes(userRole)) {
    return true;
  }

  // Hierarchy check: if a higher role is present, they implicitly have lower access
  // if requiredRoles specifies 'staff', 'admin' also has access because 3 > 2.
  const userLevel = RoleHierarchy[userRole];
  const minimumRequiredLevel = Math.min(...requiredRoles.map(r => RoleHierarchy[r]));

  return userLevel >= minimumRequiredLevel;
}
