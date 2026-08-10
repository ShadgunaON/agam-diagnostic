import { Result } from '../../shared/result';
import { ReportsModel, ReportTaskModel } from './model';

export interface IReportsRepository {
  getById(id: string): Promise<Result<ReportsModel>>;
  getAllTasks(): Promise<Result<ReportTaskModel[]>>;
}
