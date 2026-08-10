import { Result } from '../../shared/result';
import { StaffModel, RoleModel, ModuleDataModel } from './model';

export interface IStaffRepository {
  getAllStaff(): Promise<Result<StaffModel[]>>;
  getAllRoles(): Promise<Result<RoleModel[]>>;
  getRolePermissions(roleId: string): Promise<Result<ModuleDataModel[]>>;
  getAllPermissionsMap(): Promise<Result<Record<string, ModuleDataModel[]>>>;
  createStaff(staff: Omit<StaffModel, 'id'>): Promise<Result<StaffModel>>;
  createRole(role: RoleModel): Promise<Result<RoleModel>>;
  updateRolePermissions(roleId: string, moduleId: string, field: 'view' | 'create' | 'edit' | 'del', value: boolean): Promise<Result<void>>;
}
