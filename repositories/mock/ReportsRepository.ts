import { IReportsRepository } from '@/domains/reports/repository';
import { ReportsModel, ReportTaskModel } from '@/domains/reports/model';
import { Result, success } from '@/shared/result';
import { mockReportTasks } from '@/data/reports';

export class MockReportsRepository implements IReportsRepository {
  async getById(_id: string): Promise<Result<ReportsModel>> {
    return success({ 
      id: '1',
      hero: {
        title: 'My Reports',
        description: 'View and download your diagnostic reports.'
      },
      emptyState: {
        title: 'No Reports Found',
        description: 'You have no recent diagnostic reports.',
        icon: 'file-text',
        actionLabel: 'Book a Test',
        actionUrl: '/packages'
      }
    });
  }

  async getAllTasks(): Promise<Result<ReportTaskModel[]>> {
    return success(mockReportTasks as unknown as ReportTaskModel[]);
  }
}
