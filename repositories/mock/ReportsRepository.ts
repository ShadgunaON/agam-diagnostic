import { IReportsRepository } from '@/domains/reports/repository';
import { ReportsModel, ReportTaskModel } from '@/domains/reports/model';
import { Result, success, failure } from '@/shared/result';
import { mockReportTasks } from '@/data/reports';
import { SharedMockAdapter } from '@/lib/storage/SharedMockAdapter';

export class MockReportsRepository implements IReportsRepository {
  private adapter: SharedMockAdapter<ReportTaskModel[]>;

  constructor() {
    this.adapter = new SharedMockAdapter<ReportTaskModel[]>('agam_reports');
  }

  private async getTasks(): Promise<ReportTaskModel[]> {
    const loaded = await this.adapter.load();
    if (loaded && loaded.length > 0) {
      return loaded;
    }
    return [...mockReportTasks];
  }

  private async saveTasks(tasks: ReportTaskModel[]): Promise<void> {
    await this.adapter.save(tasks);
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
    return success(await this.getTasks());
  }

  async updateStatus(id: string, status: ReportTaskModel['status']): Promise<Result<ReportTaskModel>> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      return failure(new Error(`Report task not found: ${id}`));
    }
    tasks[taskIndex].status = status;
    await this.saveTasks(tasks);
    return success(tasks[taskIndex]);
  }

  async createTask(task: ReportTaskModel): Promise<Result<ReportTaskModel>> {
    const tasks = await this.getTasks();
    tasks.push(task);
    await this.saveTasks(tasks);
    return success(task);
  }
}
