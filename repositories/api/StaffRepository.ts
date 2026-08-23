import { IStaffRepository } from '@/domains/staff/repository';
import { StaffModel, RoleModel, ModuleDataModel } from '@/domains/staff/model';
import { Result, success, failure } from '@/shared/result';
import { IApiClient } from '@/lib/api/client';
import { toResult } from '@/lib/api/utils';
import { mockRoles } from '@/data/roles';
import { mockPermissionsMap } from '@/data/permissions';
import { SharedMockAdapter } from '@/lib/storage/SharedMockAdapter';

/**
 * API Staff Repository
 * 
 * Routes staff CRUD to the real /api/staff backend.
 * Roles and permissions are persisted client-side via SharedMockAdapter
 * until a dedicated backend permissions endpoint is built.
 */
export class ApiStaffRepository implements IStaffRepository {
  private permissionsAdapter: SharedMockAdapter<{ id: string; roleId: string; modules: ModuleDataModel[] }[]>;
  private rolesAdapter: SharedMockAdapter<RoleModel[]>;

  constructor(private readonly apiClient: IApiClient) {
    this.permissionsAdapter = new SharedMockAdapter<{ id: string; roleId: string; modules: ModuleDataModel[] }[]>('mock_permissions');
    this.rolesAdapter = new SharedMockAdapter<RoleModel[]>('mock_roles');
  }

  /** Ensure permissions are seeded from defaults if not yet persisted */
  private async initPermissionsIfNeeded() {
    const existing = await this.permissionsAdapter.load();
    if (!existing) {
      const defaultPermissions = Object.entries(mockPermissionsMap).map(([roleId, modules]) => ({
        id: roleId,
        roleId,
        modules: modules as ModuleDataModel[]
      }));
      await this.permissionsAdapter.save(defaultPermissions);
    }
  }

  /** Ensure roles are seeded from defaults if not yet persisted */
  private async initRolesIfNeeded() {
    const existing = await this.rolesAdapter.load();
    if (!existing) {
      await this.rolesAdapter.save(mockRoles as RoleModel[]);
    }
  }

  private normalizeStaff(s: any): StaffModel {
    return {
      id: s.id || '',
      name: s.name || '',
      role: s.role || '',
      department: s.department || 'General',
      phone: s.phone || '',
      email: s.email || '',
      shift: s.shift || 'Morning',
      status: (s.status || 'On Duty') as StaffModel['status'],
      joinDate: s.joinDate || '',
    };
  }

  async getAllStaff(): Promise<Result<StaffModel[]>> {
    const result = await toResult(this.apiClient.get<StaffModel[]>('/api/staff'));
    if (result.isSuccess) {
      const staffList = (Array.isArray(result.value) ? result.value : []).map(
        (s: any) => this.normalizeStaff(s)
      );
      return success(staffList);
    }
    return failure(result.error);
  }

  async getStaffById(id: string): Promise<Result<StaffModel>> {
    const result = await toResult(this.apiClient.get<StaffModel>(`/api/staff/${id}`));
    if (result.isSuccess) {
      return success(this.normalizeStaff(result.value));
    }
    return failure(result.error);
  }

  async createStaff(staff: Omit<StaffModel, 'id'>): Promise<Result<StaffModel>> {
    const result = await toResult(
      this.apiClient.post<{ staff: StaffModel; message: string }>('/api/staff', {
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        department: staff.department,
        shift: staff.shift,
      })
    );
    if (result.isSuccess) {
      const staffData = result.value?.staff || result.value;
      return success(this.normalizeStaff(staffData));
    }
    return failure(result.error);
  }

  async updateStaff(id: string, updates: Partial<StaffModel>): Promise<Result<StaffModel>> {
    const result = await toResult(
      this.apiClient.put<StaffModel>(`/api/staff/${id}`, updates)
    );
    if (result.isSuccess) {
      return success(this.normalizeStaff(result.value));
    }
    return failure(result.error);
  }

  // ── Roles & Permissions (frontend-managed, persisted via SharedMockAdapter) ──

  async getAllRoles(): Promise<Result<RoleModel[]>> {
    await this.initRolesIfNeeded();
    return success((await this.rolesAdapter.load()) || (mockRoles as RoleModel[]));
  }

  async getRolePermissions(roleId: string): Promise<Result<ModuleDataModel[]>> {
    await this.initPermissionsIfNeeded();
    const records = (await this.permissionsAdapter.load()) || [];
    const record = records.find(p => p.roleId === roleId);
    return success(record ? record.modules : ((mockPermissionsMap[roleId] as ModuleDataModel[]) || []));
  }

  async getAllPermissionsMap(): Promise<Result<Record<string, ModuleDataModel[]>>> {
    await this.initPermissionsIfNeeded();
    const records = (await this.permissionsAdapter.load()) || [];
    const map: Record<string, ModuleDataModel[]> = {};

    for (const r of records) {
      if (!r.modules || r.modules.length === 0) {
        map[r.roleId] = (mockPermissionsMap[r.roleId] as ModuleDataModel[]) || [];
      } else {
        map[r.roleId] = r.modules;
      }
    }

    // Ensure all default roles are present even if not yet in storage
    for (const roleId of Object.keys(mockPermissionsMap)) {
      if (!map[roleId] || map[roleId].length === 0) {
        map[roleId] = mockPermissionsMap[roleId] as ModuleDataModel[];
      }
    }

    return success(map);
  }

  async createRole(role: RoleModel): Promise<Result<RoleModel>> {
    await this.initRolesIfNeeded();
    const rolesList = (await this.rolesAdapter.load()) || [];
    rolesList.push(role);
    await this.rolesAdapter.save(rolesList);

    // Initialize empty permissions for the new role
    await this.initPermissionsIfNeeded();
    const perms = (await this.permissionsAdapter.load()) || [];
    if (!perms.find(p => p.roleId === role.id)) {
      perms.push({ id: role.id, roleId: role.id, modules: [] });
      await this.permissionsAdapter.save(perms);
    }

    return success(role);
  }

  async updateRolePermissions(roleId: string, moduleId: string, field: 'view' | 'create' | 'edit' | 'del', value: boolean): Promise<Result<void>> {
    await this.initPermissionsIfNeeded();
    const perms = (await this.permissionsAdapter.load()) || [];
    const record = perms.find(p => p.roleId === roleId);
    if (!record) return success(undefined);

    const mod = record.modules.find(m => m.id === moduleId);
    if (!mod) return success(undefined);

    if (mod.permissions && mod.permissions.length > 0) {
      (mod.permissions[0] as any)[field] = value;
    }

    await this.permissionsAdapter.save(perms);
    return success(undefined);
  }
}
