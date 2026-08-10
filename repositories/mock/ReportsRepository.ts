import { IReportsRepository } from '@/domains/reports/repository';
import { ReportsModel, ReportTaskModel } from '@/domains/reports/model';
import { Result, success } from '@/shared/result';
import { mockReportTasks } from '@/data/reports';

export class MockReportsRepository implements IReportsRepository {
  async getById(_id: string): Promise<Result<ReportsModel>> {
    return success({ id: '1' } as unknown as ReportsModel);
  }

  async getAllTasks(): Promise<Result<ReportTaskModel[]>> {
    return success(mockReportTasks as unknown as ReportTaskModel[]);
  }
}
