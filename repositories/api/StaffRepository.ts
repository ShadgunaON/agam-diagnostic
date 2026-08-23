import { IStaffRepository } from '@/domains/staff/repository';
import { StaffModel, RoleModel, ModuleDataModel } from '@/domains/staff/model';
import { Result, success, failure } from '@/shared/result';
import { IApiClient } from '@/lib/api/client';
import { toResult } from '@/lib/api/utils';
import { mockRoles } from '@/data/roles';
import { mockPermissionsMap } from '@/data/permissions';

/**
 * API Staff Repository
 * 
 * Routes staff CRUD to the real /api/staff backend.
 * Roles and permissions remain frontend-managed (data/roles, data/permissions)
 * until a backend permissions endpoint exists.
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

  // Roles and permissions remain frontend-managed
  async getAllRoles(): Promise<Result<RoleModel[]>> {
    return success(mockRoles as RoleModel[]);
  }

  async getRolePermissions(roleId: string): Promise<Result<ModuleDataModel[]>> {
    const modules = mockPermissionsMap[roleId];
    return success((modules as ModuleDataModel[]) || []);
  }

  async getAllPermissionsMap(): Promise<Result<Record<string, ModuleDataModel[]>>> {
    return success(mockPermissionsMap as Record<string, ModuleDataModel[]>);
  }

  async createRole(role: RoleModel): Promise<Result<RoleModel>> {
    return success(role);
  }

  async updateRolePermissions(roleId: string, moduleId: string, field: 'view' | 'create' | 'edit' | 'del', value: boolean): Promise<Result<void>> {
    return success(undefined);
  }
}
