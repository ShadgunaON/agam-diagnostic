export type Permission = { name: string; description: string; view: boolean; create: boolean; edit: boolean; del: boolean };
export type ModuleData = { id: string; title: string; description: string; permissions: Permission[] };

export const baseModules: ModuleData[] = [
  { id: 'patients', title: 'Patient Records', description: 'Access and modify patient medical data.', permissions: [{ name: 'records', description: '', view: false, create: false, edit: false, del: false }] },
  { id: 'orders', title: 'Service Orders', description: 'Manage home collections and lab orders.', permissions: [{ name: 'orders', description: '', view: false, create: false, edit: false, del: false }] },
  { id: 'reports', title: 'Financial Reports', description: 'View revenue and billing metrics.', permissions: [{ name: 'finance', description: '', view: false, create: false, edit: false, del: false }] },
  { id: 'catalog', title: 'Test Catalog', description: 'Manage available tests and pricing.', permissions: [{ name: 'catalog', description: '', view: false, create: false, edit: false, del: false }] },
];

export const createRolePerms = (grants: Record<string, Partial<Permission>>): ModuleData[] => {
  return baseModules.map(m => {
    const grant = grants[m.id] || {};
    return {
      ...m,
      permissions: m.permissions.map(p => ({ ...p, ...grant }))
    };
  });
};

export const mockPermissionsMap: Record<string, ModuleData[]> = {
  admin: createRolePerms({ patients: { view: true, create: true, edit: true, del: true }, orders: { view: true, create: true, edit: true, del: true }, reports: { view: true, create: true, edit: true, del: true }, catalog: { view: true, create: true, edit: true, del: true } }),
  op: createRolePerms({ patients: { view: true, create: true, edit: true }, orders: { view: true, create: true, edit: true }, catalog: { view: true, create: true, edit: true } }),
  path: createRolePerms({ patients: { view: true, edit: true }, orders: { view: true } }),
  phleb: createRolePerms({ patients: { view: true }, orders: { view: true, edit: true } }),
};
