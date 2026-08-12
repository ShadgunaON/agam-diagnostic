import { IPatientRepository } from '@/domains/patient/repository';
import { PatientModel } from '@/domains/patient/model';
import { Result, failure } from '@/shared/result';
import { ServerError } from '@/lib/api/errors';
import { IApiClient } from '@/lib/api/client';
import { PaginatedResponse } from '@/lib/api/types';

export class ApiPatientRepository implements IPatientRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getAll(_page?: number, _limit?: number): Promise<Result<PaginatedResponse<PatientModel>>> {
    return failure(new ServerError('Patient API not implemented'));
  }

  async getById(_id: string): Promise<Result<PatientModel>> {
    return failure(new ServerError('Patient API not implemented'));
  }

  async update(_id: string, _data: Partial<PatientModel>): Promise<Result<PatientModel>> {
    return failure(new ServerError('Patient API not implemented'));
  }

  async create(_patient: Omit<PatientModel, 'id'>): Promise<Result<PatientModel>> {
    return failure(new ServerError('Patient API not implemented'));
  }
}
