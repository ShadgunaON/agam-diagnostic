import { IReportsRepository } from '@/domains/reports/repository';
import { ReportsModel, ReportTaskModel } from '@/domains/reports/model';
import { Result, failure } from '@/shared/result';
import { ServerError } from '@/lib/api/errors';
import { IApiClient } from '@/lib/api/client';

export class ApiReportsRepository implements IReportsRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getById(_id: string): Promise<Result<ReportsModel>> {
    void _id;
    return failure(new ServerError('Reports API not implemented'));
  }

  async getAllTasks(): Promise<Result<ReportTaskModel[]>> {
    return failure(new ServerError('Reports API not implemented'));
  }

  async updateStatus(id: string, status: ReportTaskModel['status']): Promise<Result<ReportTaskModel>> {
    return failure(new ServerError('Reports API not implemented'));
  }

  async createTask(task: ReportTaskModel): Promise<Result<ReportTaskModel>> {
    return failure(new ServerError('Reports API not implemented'));
  }
}
