export type Permission = { name: string; description: string; view: boolean; create: boolean; edit: boolean; del: boolean; assign?: boolean };
export type ModuleData = { id: string; title: string; description: string; permissions: Permission[] };

export const baseModules: ModuleData[] = [
  { id: 'patients', title: 'Patient Records', description: 'Access and modify patient medical data.', permissions: [{ name: 'records', description: '', view: false, create: false, edit: false, del: false, assign: false }] },
  { id: 'orders', title: 'Service Orders', description: 'Manage bookings and lab orders.', permissions: [{ name: 'orders', description: '', view: false, create: false, edit: false, del: false, assign: false }] },
  { id: 'collections', title: 'Collections & Dispatch', description: 'Manage home collections and in-lab visits.', permissions: [{ name: 'collections', description: '', view: false, create: false, edit: false, del: false, assign: false }] },
  { id: 'reports', title: 'Reports', description: 'View and manage diagnostic reports.', permissions: [{ name: 'reports', description: '', view: false, create: false, edit: false, del: false, assign: false }] },
  { id: 'catalog', title: 'Test Catalog', description: 'Manage available tests and pricing.', permissions: [{ name: 'catalog', description: '', view: false, create: false, edit: false, del: false, assign: false }] },
  { id: 'staff', title: 'Staff & Roles', description: 'Manage staff members and role assignments.', permissions: [{ name: 'staff', description: '', view: false, create: false, edit: false, del: false, assign: false }] },
  { id: 'analytics', title: 'Analytics', description: 'View dashboards and business metrics.', permissions: [{ name: 'analytics', description: '', view: false, create: false, edit: false, del: false, assign: false }] },
  { id: 'settings', title: 'Settings', description: 'System configuration and preferences.', permissions: [{ name: 'settings', description: '', view: false, create: false, edit: false, del: false, assign: false }] },
  { id: 'blogs', title: 'Content / Blogs', description: 'Manage blog posts and content.', permissions: [{ name: 'blogs', description: '', view: false, create: false, edit: false, del: false, assign: false }] },
  { id: 'invoices', title: 'Ledger & Invoices', description: 'View and manage financial records.', permissions: [{ name: 'invoices', description: '', view: false, create: false, edit: false, del: false, assign: false }] },
  { id: 'reviews', title: 'Reviews', description: 'View and manage patient reviews.', permissions: [{ name: 'reviews', description: '', view: false, create: false, edit: false, del: false, assign: false }] },
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

const allTrue = { view: true, create: true, edit: true, del: true, assign: true };

export const mockPermissionsMap: Record<string, ModuleData[]> = {
  admin: createRolePerms({
    patients: allTrue, orders: allTrue, collections: allTrue, reports: allTrue,
    catalog: allTrue, staff: allTrue, analytics: allTrue, settings: allTrue,
    blogs: allTrue, invoices: allTrue, reviews: allTrue
  }),
  op: createRolePerms({
    patients: { view: true, create: true, edit: true },
    orders: { view: true, create: true, edit: true },
    collections: { view: true, create: true, edit: true, assign: true },
    reports: { view: true },
    catalog: { view: true, create: true, edit: true },
    staff: { view: true, create: false, edit: true },
    invoices: { view: true },
    reviews: { view: true }
  }),
  path: createRolePerms({
    patients: { view: true, edit: true },
    orders: { view: true },
    collections: { view: true },
    reports: { view: true, edit: true }
  }),
  phleb: createRolePerms({
    patients: { view: true },
    orders: { view: true, edit: true },
    collections: { view: true, edit: true }
  }),
  phleb_home: createRolePerms({
    collections: { view: true, edit: true },
    patients: { view: true }
  }),
  phleb_lab: createRolePerms({
    collections: { view: true, edit: true },
    patients: { view: true }
  }),
};
