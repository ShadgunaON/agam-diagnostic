import { Result } from '../../shared/result';
import { ActivityRecordModel } from './model';

export interface IActivityRepository {
  getAll(): Promise<Result<ActivityRecordModel[]>>;
}
