import { IStaffRepository } from '@/domains/staff/repository';
import { StaffModel, RoleModel, ModuleDataModel } from '@/domains/staff/model';
import { Result, success } from '@/shared/result';
import { mockStaff } from '@/data/staff';
import { mockRoles } from '@/data/roles';
import { mockPermissionsMap } from '@/data/permissions';

export class MockStaffRepository implements IStaffRepository {
  private staff: StaffModel[];
  private roles: RoleModel[];
  private permissionsMap: Record<string, ModuleDataModel[]>;

  constructor() {
    this.staff = [...mockStaff];
    this.roles = [...mockRoles];
    this.permissionsMap = JSON.parse(JSON.stringify(mockPermissionsMap));
  }

  async getAllStaff(): Promise<Result<StaffModel[]>> {
    return success([...this.staff]);
  }

  async getAllRoles(): Promise<Result<RoleModel[]>> {
    return success([...this.roles]);
  }

  async getRolePermissions(roleId: string): Promise<Result<ModuleDataModel[]>> {
    return success(this.permissionsMap[roleId] || []);
  }

  async getAllPermissionsMap(): Promise<Result<Record<string, ModuleDataModel[]>>> {
    return success(this.permissionsMap);
  }

  async createStaff(staffParams: Omit<StaffModel, 'id'>): Promise<Result<StaffModel>> {
    const newStaff = { ...staffParams, id: Math.random().toString() };
    this.staff.push(newStaff);
    return success(newStaff);
  }

  async createRole(role: RoleModel): Promise<Result<RoleModel>> {
    this.roles.push(role);
    // Initialize permissions for the new role if not provided
    if (!this.permissionsMap[role.id]) {
      this.permissionsMap[role.id] = []; 
    }
    return success(role);
  }

  async updateRolePermissions(roleId: string, moduleId: string, field: 'view' | 'create' | 'edit' | 'del', value: boolean): Promise<Result<void>> {
    if (!this.permissionsMap[roleId]) return success(undefined);
    const modules = this.permissionsMap[roleId];
    const modIndex = modules.findIndex(m => m.id === moduleId);
    if (modIndex >= 0) {
      if (modules[modIndex].permissions && modules[modIndex].permissions.length > 0) {
        modules[modIndex].permissions[0][field] = value;
      }
    }
    return success(undefined);
  }
}
