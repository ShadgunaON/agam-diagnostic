import { IReportsRepository } from '@/domains/reports/repository';

export class ReportsService {
  constructor(private readonly repository: IReportsRepository) {}

  async getById(id: string) {
    return this.repository.getById(id);
  }

  async getAllTasks() {
    return this.repository.getAllTasks();
  }
}
