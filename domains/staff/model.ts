export type StaffStatus = 'On Duty' | 'Off Duty' | 'On Leave';

export interface StaffModel {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  shift: string;
  status: StaffStatus;
  joinDate: string;
}

export interface RoleModel {
  id: string;
  title: string;
  internal: string;
  users: number;
  desc: string;
  color: string;
  scope?: string;
}

export interface PermissionModel {
  name: string;
  description: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  del: boolean;
  assign?: boolean;
}

export interface ModuleDataModel {
  id: string;
  title: string;
  description: string;
  permissions: PermissionModel[];
}
