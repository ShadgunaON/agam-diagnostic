import { Result } from '../../shared/result';
import { ReportsModel, ReportTaskModel } from './model';

export interface IReportsRepository {
  getById(id: string): Promise<Result<ReportsModel>>;
  getAllTasks(): Promise<Result<ReportTaskModel[]>>;
  updateStatus(id: string, status: ReportTaskModel['status']): Promise<Result<ReportTaskModel>>;
  createTask(task: ReportTaskModel): Promise<Result<ReportTaskModel>>;
}
