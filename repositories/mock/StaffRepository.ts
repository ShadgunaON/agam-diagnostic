import { IStaffRepository } from '@/domains/staff/repository';
import { StaffModel, RoleModel, ModuleDataModel } from '@/domains/staff/model';
import { Result, success, failure } from '@/shared/result';
import { mockStaff } from '@/data/staff';
import { mockRoles } from '@/data/roles';
import { mockPermissionsMap } from '@/data/permissions';
import { SharedMockAdapter } from '@/lib/storage/SharedMockAdapter';

export class MockStaffRepository implements IStaffRepository {
  private staffAdapter: SharedMockAdapter<StaffModel[]>;
  private rolesAdapter: SharedMockAdapter<RoleModel[]>;
  private permissionsAdapter: SharedMockAdapter<{ id: string; roleId: string; modules: ModuleDataModel[] }[]>;

  constructor() {
    this.staffAdapter = new SharedMockAdapter<StaffModel[]>('mock_staff');
    this.rolesAdapter = new SharedMockAdapter<RoleModel[]>('mock_roles');
    this.permissionsAdapter = new SharedMockAdapter<{ id: string; roleId: string; modules: ModuleDataModel[] }[]>('mock_permissions');
  }

  private async initializeIfNeeded() {
    const staffLoaded = await this.staffAdapter.load();
    if (!staffLoaded) await this.staffAdapter.save(mockStaff);
    
    const rolesLoaded = await this.rolesAdapter.load();
    if (!rolesLoaded) await this.rolesAdapter.save(mockRoles);
    
    const permsLoaded = await this.permissionsAdapter.load();
    if (!permsLoaded) {
      const defaultPermissions = Object.entries(mockPermissionsMap).map(([roleId, modules]) => ({
        id: roleId,
        roleId,
        modules
      }));
      await this.permissionsAdapter.save(defaultPermissions);
    }
  }

  async getAllStaff(): Promise<Result<StaffModel[]>> {
    await this.initializeIfNeeded();
    return success((await this.staffAdapter.load()) || []);
  }

  async getStaffById(id: string): Promise<Result<StaffModel>> {
    await this.initializeIfNeeded();
    const staff = (await this.staffAdapter.load()) || [];
    const found = staff.find((s: StaffModel) => s.id === id);
    if (!found) return failure(new Error('Staff not found'));
    return success(found);
  }

  async getAllRoles(): Promise<Result<RoleModel[]>> {
    await this.initializeIfNeeded();
    return success((await this.rolesAdapter.load()) || []);
  }

  async getRolePermissions(roleId: string): Promise<Result<ModuleDataModel[]>> {
    await this.initializeIfNeeded();
    const perms = (await this.permissionsAdapter.load()) || [];
    const record = perms.find((p) => p.roleId === roleId);
    return success(record ? record.modules : []);
  }

  async getAllPermissionsMap(): Promise<Result<Record<string, ModuleDataModel[]>>> {
    await this.initializeIfNeeded();
    const records = (await this.permissionsAdapter.load()) || [];
    const map: Record<string, ModuleDataModel[]> = {};
    for (const r of records) {
      if (!r.modules || r.modules.length === 0) {
        map[r.roleId] = mockPermissionsMap[r.roleId] || [];
      } else {
        map[r.roleId] = r.modules;
      }
    }
    // Fallback for missing default roles
    for (const roleId of Object.keys(mockPermissionsMap)) {
      if (!map[roleId] || map[roleId].length === 0) {
        map[roleId] = mockPermissionsMap[roleId];
      }
    }
    return success(map);
  }

  async createStaff(staffParams: Omit<StaffModel, 'id'>): Promise<Result<StaffModel>> {
    await this.initializeIfNeeded();
    const id = `STAFF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newStaff: StaffModel = { ...staffParams, id };
    const staffList = (await this.staffAdapter.load()) || [];
    staffList.push(newStaff);
    await this.staffAdapter.save(staffList);
    return success(newStaff);
  }

  async updateStaff(id: string, updates: Partial<StaffModel>): Promise<Result<StaffModel>> {
    await this.initializeIfNeeded();
    const staffList = (await this.staffAdapter.load()) || [];
    const index = staffList.findIndex((s: StaffModel) => s.id === id);
    if (index === -1) return failure(new Error('Staff not found'));
    
    const updated = { ...staffList[index], ...updates };
    staffList[index] = updated;
    await this.staffAdapter.save(staffList);
    return success(updated);
  }

  async createRole(role: Omit<RoleModel, 'id'>): Promise<Result<RoleModel>> {
    await this.initializeIfNeeded();
    const rolesList = (await this.rolesAdapter.load()) || [];
    const newRole = { ...role, id: `ROLE-${Date.now()}` };
    rolesList.push(newRole);
    await this.rolesAdapter.save(rolesList);
    
    const perms = (await this.permissionsAdapter.load()) || [];
    if (!perms.find(p => p.roleId === newRole.id)) {
      perms.push({ id: newRole.id, roleId: newRole.id, modules: [] });
      await this.permissionsAdapter.save(perms);
    }
    return success(newRole);
  }

  async updateRolePermissions(roleId: string, moduleId: string, field: 'view' | 'create' | 'edit' | 'del', value: boolean): Promise<Result<void>> {
    await this.initializeIfNeeded();
    const perms = (await this.permissionsAdapter.load()) || [];
    const record = perms.find(p => p.roleId === roleId);
    if (!record) return success(undefined);
    
    const mod = record.modules.find(m => m.id === moduleId);
    if (!mod) return success(undefined);
    
    if (mod.permissions && mod.permissions.length > 0) {
      mod.permissions[0][field] = value;
    }
    
    await this.permissionsAdapter.save(perms);
    return success(undefined);
  }

  async updateAllPermissions(map: Record<string, ModuleDataModel[]>): Promise<Result<void>> {
    const records = Object.entries(map).map(([roleId, modules]) => ({
      id: roleId,
      roleId,
      modules
    }));
    await this.permissionsAdapter.save(records);
    return success(undefined);
  }
}
