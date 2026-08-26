import { IStaffRepository } from '@/domains/staff/repository';
import { StaffModel, RoleModel, ModuleDataModel } from '@/domains/staff/model';
import { Result, success, failure } from '@/shared/result';
import { IApiClient } from '@/lib/api/client';
import { toResult } from '@/lib/api/utils';
import { mockRoles } from '@/data/roles';
import { mockPermissionsMap, createRolePerms } from '@/data/permissions';

/**
 * API Staff Repository
 * 
 * Routes staff CRUD to the real /api/staff backend.
 * Roles and permissions are persisted centrally via DynamoDB.
 */
export class ApiStaffRepository implements IStaffRepository {
  constructor(private readonly apiClient: IApiClient) {}

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

  // ── Roles & Permissions (backend-managed via /api/staff/roles and /api/staff/permissions) ──

  async getAllRoles(): Promise<Result<RoleModel[]>> {
    const result = await toResult(this.apiClient.get<RoleModel[]>('/api/staff/roles'));
    if (result.isSuccess) {
      return success(result.value || []);
    }
    return failure(result.error);
  }

  async getRolePermissions(roleId: string): Promise<Result<ModuleDataModel[]>> {
    const mapResult = await this.getAllPermissionsMap();
    if (mapResult.isSuccess) {
      return success(mapResult.value[roleId] || []);
    }
    return failure(mapResult.error);
  }

  async getAllPermissionsMap(): Promise<Result<Record<string, ModuleDataModel[]>>> {
    const result = await toResult(this.apiClient.get<any[]>('/api/staff/permissions'));
    
    if (!result.isSuccess) {
      // FAIL-CLOSED: Do not fallback to mock permissions on API failure.
      return failure(result.error);
    }

    const records = result.value || [];
    const map: Record<string, ModuleDataModel[]> = {};

    for (const r of records) {
      if (r.modules && r.modules.length > 0) {
        map[r.roleId] = r.modules;
      }
    }

    return success(map);
  }

  async createRole(role: RoleModel): Promise<Result<RoleModel>> {
    const result = await toResult(this.apiClient.post<RoleModel>('/api/staff/roles', role));
    if (result.isSuccess) {
      return success(result.value);
    }
    return failure(result.error);
  }

  async updateRolePermissions(roleId: string, moduleId: string, field: 'view' | 'create' | 'edit' | 'del', value: boolean): Promise<Result<void>> {
    // Not used efficiently by AdminStaffPage loop, but kept for interface compliance
    const mapResult = await this.getAllPermissionsMap();
    if (!mapResult.isSuccess) return failure(mapResult.error);
    
    const map = mapResult.value;
    const modules = map[roleId] || [];
    const mod = modules.find(m => m.id === moduleId);
    
    if (mod && mod.permissions && mod.permissions.length > 0) {
      (mod.permissions[0] as any)[field] = value;
    }
    
    return this.updateAllPermissions(map);
  }

  async updateAllPermissions(map: Record<string, ModuleDataModel[]>): Promise<Result<void>> {
    const records = Object.entries(map).map(([roleId, modules]) => ({
      id: roleId,
      roleId,
      modules
    }));
    
    const result = await toResult(this.apiClient.put<void>('/api/staff/permissions', records));
    if (result.isSuccess) {
      return success(undefined);
    }
    return failure(result.error);
  }
}
