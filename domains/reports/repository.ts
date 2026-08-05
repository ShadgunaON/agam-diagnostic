import { Result } from '../../shared/result';
import { ReportsModel } from './model';

export interface IReportsRepository {
  getById(id: string): Promise<Result<ReportsModel>>;
}
