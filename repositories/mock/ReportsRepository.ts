import { IReportsRepository } from '@/domains/reports/repository';
import { ReportsModel, ReportTaskModel } from '@/domains/reports/model';
import { Result, success, failure } from '@/shared/result';
import { mockReportTasks } from '@/data/reports';
import { LocalStorageAdapter } from '@/lib/storage/LocalStorageAdapter';

export class MockReportsRepository implements IReportsRepository {
  private adapter: LocalStorageAdapter<ReportTaskModel[]>;

  constructor() {
    this.adapter = new LocalStorageAdapter<ReportTaskModel[]>('agam_reports');
  }

  private getTasks(): ReportTaskModel[] {
    const loaded = this.adapter.load();
    if (loaded && loaded.length > 0) {
      return loaded;
    }
    return [...mockReportTasks];
  }

  private saveTasks(tasks: ReportTaskModel[]): void {
    this.adapter.save(tasks);
  }

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
    return success(this.getTasks());
  }

  async updateStatus(id: string, status: ReportTaskModel['status']): Promise<Result<ReportTaskModel>> {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return failure(new Error(`Report task not found: ${id}`));
    }
    tasks[taskIndex].status = status;
    this.saveTasks(tasks);
    return success(tasks[taskIndex]);
  }
}
