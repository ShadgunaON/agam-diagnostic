import { IPatientRepository } from '@/domains/patient/repository';
import { PatientModel } from '@/domains/patient/model';
import { Result, success } from '@/shared/result';
import { IApiClient } from '@/lib/api/client';
import { PaginatedResponse } from '@/lib/api/types';
import { toResult } from '@/lib/api/utils';

export function normalizePatient(raw: any): PatientModel {
  if (!raw || typeof raw !== 'object') {
    return {
      id: 'unknown',
      name: 'Unknown Patient',
      age: 0,
      gender: 'Unknown',
      phone: 'N/A',
      email: '',
      status: 'Active',
      bloodGroup: 'Unknown',
      createdAt: new Date().toISOString()
    };
  }

  return {
    id: String(raw.id || raw.PK?.replace('PATIENT#', '') || `pat_${Date.now()}`),
    name: raw.name || raw.fullName || 'Unknown Patient',
    age: typeof raw.age === 'number' ? raw.age : (parseInt(raw.age, 10) || 0),
    gender: raw.gender || 'Unknown',
    phone: raw.phone || raw.mobile || 'N/A',
    email: raw.email || '',
    status: (raw.status || 'Active') as PatientModel['status'],
    bloodGroup: raw.bloodGroup || 'Unknown',
    relation: raw.relation || undefined,
    dobOrAge: raw.dobOrAge || undefined,
    ownerSub: raw.ownerSub || undefined,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || undefined,
  };
}

export class ApiPatientRepository implements IPatientRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getAll(page: number = 1, limit: number = 10): Promise<Result<PaginatedResponse<PatientModel>>> {
    const res = await toResult(this.apiClient.get<PatientModel[]>(`/api/patients?page=${page}&limit=${limit}`));
    if (res.isSuccess) {
      const items = Array.isArray(res.value) ? res.value.map(normalizePatient) : [];
      return success({
        data: items,
        meta: {
          total: items.length,
          page,
          limit,
          totalPages: 1
        }
      });
    }
    return res;
  }

  async getMe(): Promise<Result<PatientModel>> {
    const res = await toResult(this.apiClient.get<PatientModel>('/api/patients/me'));
    if (res.isSuccess && res.value) return success(normalizePatient(res.value));
    return res;
  }

  async getById(id: string): Promise<Result<PatientModel>> {
    const res = await toResult(this.apiClient.get<PatientModel>(`/api/patients/${id}`));
    if (res.isSuccess && res.value) return success(normalizePatient(res.value));
    return res;
  }

  async update(id: string, data: Partial<PatientModel>): Promise<Result<PatientModel>> {
    const res = await toResult(this.apiClient.put<PatientModel>(`/api/patients/${id}`, data));
    if (res.isSuccess && res.value) return success(normalizePatient(res.value));
    return res;
  }

  async create(patient: Omit<PatientModel, 'id'>): Promise<Result<PatientModel>> {
    const res = await toResult(this.apiClient.post<PatientModel>('/api/patients', patient));
    if (res.isSuccess && res.value) return success(normalizePatient(res.value));
    return res;
  }
}
