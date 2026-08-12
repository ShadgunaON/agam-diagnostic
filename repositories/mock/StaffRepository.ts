import { IStaffRepository } from '@/domains/staff/repository';
import { StaffModel, RoleModel, ModuleDataModel } from '@/domains/staff/model';
import { Result, success, failure } from '@/shared/result';
import { mockStaff } from '@/data/staff';
import { mockRoles } from '@/data/roles';
import { mockPermissionsMap } from '@/data/permissions';
import { LocalStorageAdapter } from '@/lib/storage/LocalStorageAdapter';

export class MockStaffRepository implements IStaffRepository {
  private staffAdapter: LocalStorageAdapter<StaffModel[]>;
  private rolesAdapter: LocalStorageAdapter<RoleModel[]>;
  private permissionsAdapter: LocalStorageAdapter<{ id: string; roleId: string; modules: ModuleDataModel[] }[]>;

  constructor() {
    this.staffAdapter = new LocalStorageAdapter<StaffModel[]>('mock_staff');
    this.rolesAdapter = new LocalStorageAdapter<RoleModel[]>('mock_roles');
    this.permissionsAdapter = new LocalStorageAdapter<{ id: string; roleId: string; modules: ModuleDataModel[] }[]>('mock_permissions');

    if (!this.staffAdapter.load()) this.staffAdapter.save(mockStaff);
    if (!this.rolesAdapter.load()) this.rolesAdapter.save(mockRoles);
    
    if (!this.permissionsAdapter.load()) {
      const defaultPermissions = Object.entries(mockPermissionsMap).map(([roleId, modules]) => ({
        id: roleId,
        roleId,
        modules
      }));
      this.permissionsAdapter.save(defaultPermissions);
    }
  }

  async getAllStaff(): Promise<Result<StaffModel[]>> {
    return success(this.staffAdapter.load() || []);
  }

  async getStaffById(id: string): Promise<Result<StaffModel>> {
    const staff = this.staffAdapter.load() || [];
    const found = staff.find((s: StaffModel) => s.id === id);
    if (!found) return failure(new Error('Staff not found'));
    return success(found);
  }

  async getAllRoles(): Promise<Result<RoleModel[]>> {
    return success(this.rolesAdapter.load() || []);
  }

  async getRolePermissions(roleId: string): Promise<Result<ModuleDataModel[]>> {
    const perms = this.permissionsAdapter.load() || [];
    const record = perms.find((p) => p.roleId === roleId);
    return success(record ? record.modules : []);
  }

  async getAllPermissionsMap(): Promise<Result<Record<string, ModuleDataModel[]>>> {
    const records = this.permissionsAdapter.load() || [];
    const map: Record<string, ModuleDataModel[]> = {};
    for (const r of records) {
      map[r.roleId] = r.modules;
    }
    return success(map);
  }

  async createStaff(staffParams: Omit<StaffModel, 'id'>): Promise<Result<StaffModel>> {
    const id = `STAFF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newStaff: StaffModel = { ...staffParams, id };
    const staffList = this.staffAdapter.load() || [];
    staffList.push(newStaff);
    this.staffAdapter.save(staffList);
    return success(newStaff);
  }

  async updateStaff(id: string, updates: Partial<StaffModel>): Promise<Result<StaffModel>> {
    const staffList = this.staffAdapter.load() || [];
    const index = staffList.findIndex((s: StaffModel) => s.id === id);
    if (index === -1) return failure(new Error('Staff not found'));
    
    const updated = { ...staffList[index], ...updates };
    staffList[index] = updated;
    this.staffAdapter.save(staffList);
    return success(updated);
  }

  async createRole(role: Omit<RoleModel, 'id'>): Promise<Result<RoleModel>> {
    const rolesList = this.rolesAdapter.load() || [];
    const newRole = { ...role, id: `ROLE-${Date.now()}` };
    rolesList.push(newRole);
    this.rolesAdapter.save(rolesList);
    
    const perms = this.permissionsAdapter.load() || [];
    if (!perms.find(p => p.roleId === newRole.id)) {
      perms.push({ id: newRole.id, roleId: newRole.id, modules: [] });
      this.permissionsAdapter.save(perms);
    }
    return success(newRole);
  }

  async updateRolePermissions(roleId: string, moduleId: string, field: 'view' | 'create' | 'edit' | 'del', value: boolean): Promise<Result<void>> {
    const perms = this.permissionsAdapter.load() || [];
    const record = perms.find(p => p.roleId === roleId);
    if (!record) return success(undefined);
    
    const modules = record.modules;
    const modIndex = modules.findIndex((m: ModuleDataModel) => m.id === moduleId);
    if (modIndex >= 0) {
      if (modules[modIndex].permissions && modules[modIndex].permissions.length > 0) {
        modules[modIndex].permissions[0][field] = value;
        const index = perms.findIndex(p => p.roleId === roleId);
        if (index !== -1) {
          perms[index] = { ...record, modules };
          this.permissionsAdapter.save(perms);
        }
      }
    }
    return success(undefined);
  }
}
