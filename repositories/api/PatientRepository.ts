import { IPatientRepository } from '@/domains/patient/repository';
import { PatientModel } from '@/domains/patient/model';
import { Result, success } from '@/shared/result';
import { IApiClient } from '@/lib/api/client';
import { PaginatedResponse } from '@/lib/api/types';
import { toResult } from '@/lib/api/utils';

export class ApiPatientRepository implements IPatientRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getAll(page: number = 1, limit: number = 10): Promise<Result<PaginatedResponse<PatientModel>>> {
    const res = await toResult(this.apiClient.get<PatientModel[]>(`/api/patients?page=${page}&limit=${limit}`));
    if (res.isSuccess) {
      const items = Array.isArray(res.value) ? res.value : [];
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
    return toResult(this.apiClient.get<PatientModel>('/api/patients/me'));
  }

  async getById(id: string): Promise<Result<PatientModel>> {
    return toResult(this.apiClient.get<PatientModel>(`/api/patients/${id}`));
  }

  async update(id: string, data: Partial<PatientModel>): Promise<Result<PatientModel>> {
    return toResult(this.apiClient.put<PatientModel>(`/api/patients/${id}`, data));
  }

  async create(patient: Omit<PatientModel, 'id'>): Promise<Result<PatientModel>> {
    return toResult(this.apiClient.post<PatientModel>('/api/patients', patient));
  }
}
