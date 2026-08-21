import { Result } from '../../shared/result';
import { PatientModel } from './model';
import { PaginatedResponse } from '../../lib/api/types';

export interface IPatientRepository {
  getAll(page?: number, limit?: number): Promise<Result<PaginatedResponse<PatientModel>>>;
  getMe?(): Promise<Result<PatientModel>>;
  getById(id: string): Promise<Result<PatientModel>>;
  update(id: string, data: Partial<PatientModel>): Promise<Result<PatientModel>>;
  create(patient: Omit<PatientModel, 'id'>): Promise<Result<PatientModel>>;
}
