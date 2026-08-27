import { IReportsRepository } from '@/domains/reports/repository';
import { ReportsModel, ReportTaskModel } from '@/domains/reports/model';
import { Result, failure, success } from '@/shared/result';
import { ServerError } from '@/lib/api/errors';
import { IApiClient } from '@/lib/api/client';

function normalizeReportTask(raw: any): ReportTaskModel {
  return {
    id: raw.id || `REP-unknown`,
    patientId: raw.patientId,
    bookingId: raw.bookingId,
    patient: {
      name: raw.patient?.name || 'Unknown Patient',
      age: raw.patient?.age || 0,
      gender: raw.patient?.gender || 'Unknown',
      id: raw.patient?.id || raw.patientId || 'unknown'
    },
    testType: raw.testType || (Array.isArray(raw.tests) ? raw.tests.join(', ') : 'Unknown Test'),
    status: (raw.status === 'Pending' ? 'Processing' : raw.status) || 'Processing',
    priority: raw.priority || 'Routine',
    time: raw.time || (raw.createdAt ? new Date(raw.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),
    results: Array.isArray(raw.results) ? raw.results : []
  };
}

export class ApiReportsRepository implements IReportsRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getById(id: string): Promise<Result<ReportsModel>> {
    try {
      const response = await this.apiClient.get<ReportsModel>(`/api/reports/${id}`);
      return success(response.data!);
    } catch (err: any) {
      return failure(new ServerError(err.message || 'Failed to fetch report'));
    }
  }

  async getAllTasks(): Promise<Result<ReportTaskModel[]>> {
    try {
      const response = await this.apiClient.get<any[]>('/api/reports');
      const items = (response.data || []).map(normalizeReportTask);
      return success(items);
    } catch (err: any) {
      return failure(new ServerError(err.message || 'Failed to fetch reports'));
    }
  }

  async updateStatus(id: string, status: ReportTaskModel['status']): Promise<Result<ReportTaskModel>> {
    try {
      const response = await this.apiClient.put<ReportTaskModel>(`/api/reports/${id}/status`, { status });
      return success(response.data!);
    } catch (err: any) {
      return failure(new ServerError(err.message || 'Failed to update report status'));
    }
  }

  async createTask(task: ReportTaskModel): Promise<Result<ReportTaskModel>> {
    try {
      const response = await this.apiClient.post<ReportTaskModel>('/api/reports', task);
      return success(response.data!);
    } catch (err: any) {
      return failure(new ServerError(err.message || 'Failed to create report'));
    }
  }
}
