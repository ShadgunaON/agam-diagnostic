import { ModuleDataModel, StaffModel, RoleModel } from '@/domains/staff/model';
import { Result, success, failure } from '@/shared/result';

export class StaffService {
  constructor() {}

  private async _graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      const token = typeof window !== 'undefined'
        ? (sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '')
        : '';
      const _url = typeof window === 'undefined' ? (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/api/graphql' : '/api/graphql';
      const response = await fetch(_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
      });
      if (!response.ok) return null;
      const { data, errors } = await response.json();
      if (errors?.length) { 
        console.error('GraphQL errors:', errors); 
        throw new Error(errors[0].message); 
      }
      return data as T;
    } catch (err) {
      console.error('GraphQL fetch failed:', err);
      throw err;
    }
  }

  async getAllStaff(): Promise<Result<StaffModel[]>> {
    try {
      const data = await this._graphqlFetch<{ adminStaffWorkspace: StaffModel[] }>(
        `query {
          adminStaffWorkspace {
            id name role department phone email shift joinDate status
          }
        }`
      );
      return success(data?.adminStaffWorkspace || []);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  async getStaffById(id: string): Promise<Result<StaffModel>> {
    try {
      const data = await this._graphqlFetch<{ staffById: StaffModel }>(
        `query GetStaff($id: ID!) {
          staffById(id: $id) {
            id name role department phone email shift joinDate status
          }
        }`,
        { id }
      );
      if (!data?.staffById) return failure(new Error('Staff not found'));
      return success(data.staffById);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  async getAllRoles(): Promise<Result<RoleModel[]>> {
    try {
      const data = await this._graphqlFetch<{ adminRoles: RoleModel[] }>(
        `query {
          adminRoles {
            id title internal users desc color scope
          }
        }`
      );
      return success(data?.adminRoles || []);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  async getAllPermissionsMap(): Promise<Result<Record<string, ModuleDataModel[]>>> {
    try {
      const data = await this._graphqlFetch<{ adminPermissionsMap: string }>(
        `query { adminPermissionsMap }`
      );
      if (!data?.adminPermissionsMap) return success({});
      
      const records = JSON.parse(data.adminPermissionsMap) || [];
      const map: Record<string, ModuleDataModel[]> = {};
      for (const r of records) {
        if (r.modules && r.modules.length > 0) {
          map[r.roleId] = r.modules;
        }
      }
      return success(map);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  async getRolePermissions(roleId: string): Promise<Result<ModuleDataModel[]>> {
    const mapResult = await this.getAllPermissionsMap();
    if (mapResult.isSuccess) {
      return success(mapResult.value[roleId] || []);
    }
    return failure(mapResult.error);
  }

  async createStaff(staff: Omit<StaffModel, 'id'>): Promise<Result<StaffModel>> {
    try {
      const data = await this._graphqlFetch<{ createStaff: StaffModel }>(
        `mutation CreateStaff($name: String!, $email: String!, $phone: String!, $role: String!, $department: String!, $shift: String!) {
          createStaff(name: $name, email: $email, phone: $phone, role: $role, department: $department, shift: $shift) {
            id name role department phone email shift joinDate status
          }
        }`,
        { ...staff }
      );
      return success(data!.createStaff);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  async updateStaff(id: string, updates: Partial<StaffModel>): Promise<Result<StaffModel>> {
    try {
      const data = await this._graphqlFetch<{ updateStaff: StaffModel }>(
        `mutation UpdateStaff($id: ID!, $name: String, $email: String, $phone: String, $role: String, $department: String, $shift: String, $status: String) {
          updateStaff(id: $id, name: $name, email: $email, phone: $phone, role: $role, department: $department, shift: $shift, status: $status) {
            id name role department phone email shift joinDate status
          }
        }`,
        { id, ...updates }
      );
      return success(data!.updateStaff);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  async createRole(role: RoleModel): Promise<Result<RoleModel>> {
    try {
      const data = await this._graphqlFetch<{ createRole: RoleModel }>(
        `mutation CreateRole($title: String!, $internal: String!, $desc: String, $color: String) {
          createRole(title: $title, internal: $internal, desc: $desc, color: $color) {
            id title internal users desc color scope
          }
        }`,
        { title: role.title, internal: role.internal, desc: role.desc, color: role.color }
      );
      return success(data!.createRole);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  async updateAllPermissions(map: Record<string, ModuleDataModel[]>): Promise<Result<void>> {
    try {
      const records = Object.entries(map).map(([roleId, modules]) => ({
        id: roleId,
        roleId,
        modules
      }));
      await this._graphqlFetch<{ updatePermissions: boolean }>(
        `mutation UpdatePermissions($records: String!) {
          updatePermissions(records: $records)
        }`,
        { records: JSON.stringify(records) }
      );
      return success(undefined);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  async updateRolePermissions(roleId: string, moduleId: string, field: 'view' | 'create' | 'edit' | 'del', value: boolean): Promise<Result<void>> {
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
}
