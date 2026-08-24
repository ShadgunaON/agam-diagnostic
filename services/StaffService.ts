import { IStaffRepository } from '@/domains/staff/repository';
import { Result } from '@/shared/result';
import { ModuleDataModel } from '@/domains/staff/model';

export class StaffService {
  constructor(private readonly repository: IStaffRepository) {}

  async getAllStaff() {
    return this.repository.getAllStaff();
  }

  async getStaffById(id: string) {
    return this.repository.getStaffById(id);
  }

  async getAllRoles() {
    return this.repository.getAllRoles();
  }

  async getRolePermissions(roleId: string) {
    return this.repository.getRolePermissions(roleId);
  }

  async getAllPermissionsMap() {
    return this.repository.getAllPermissionsMap();
  }

  async createStaff(staff: Omit<import('@/domains/staff/model').StaffModel, 'id'>) {
    return this.repository.createStaff(staff);
  }

  async updateStaff(id: string, updates: Partial<import('@/domains/staff/model').StaffModel>) {
    return this.repository.updateStaff(id, updates);
  }

  async createRole(role: import('@/domains/staff/model').RoleModel) {
    return this.repository.createRole(role);
  }

  async updateRolePermissions(roleId: string, moduleId: string, field: 'view' | 'create' | 'edit' | 'del', value: boolean): Promise<Result<void>> {
    return this.repository.updateRolePermissions(roleId, moduleId, field, value);
  }

  async updateAllPermissions(map: Record<string, ModuleDataModel[]>): Promise<Result<void>> {
    return this.repository.updateAllPermissions(map);
  }
}
