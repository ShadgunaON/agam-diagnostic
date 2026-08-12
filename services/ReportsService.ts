import { IReportsRepository } from '@/domains/reports/repository';
import { ReportTaskModel } from '@/domains/reports/model';

export class ReportsService {
  constructor(private readonly repository: IReportsRepository) {}

  async getById(id: string) {
    return this.repository.getById(id);
  }

  async getAllTasks() {
    return this.repository.getAllTasks();
  }

  async updateStatus(id: string, status: ReportTaskModel['status']) {
    return this.repository.updateStatus(id, status);
  }
}
