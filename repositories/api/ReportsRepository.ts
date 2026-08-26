import { IReportsRepository } from '@/domains/reports/repository';
import { ReportsModel, ReportTaskModel } from '@/domains/reports/model';
import { Result, failure, success } from '@/shared/result';
import { ServerError } from '@/lib/api/errors';
import { IApiClient } from '@/lib/api/client';

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
      const response = await this.apiClient.get<ReportTaskModel[]>('/api/reports');
      return success(response.data || []);
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
