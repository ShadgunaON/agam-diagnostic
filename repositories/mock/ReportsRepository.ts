import { IReportsRepository } from '@/domains/reports/repository';
import { ReportsModel } from '@/domains/reports/model';
import { Result, success } from '@/shared/result';
import { reportsData } from '@/data/reports';

export class MockReportsRepository implements IReportsRepository {
  async getById(_id: string): Promise<Result<ReportsModel>> {
    void _id;
    return success(reportsData as unknown as ReportsModel);
  }
}
