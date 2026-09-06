import { ActivityRecordModel } from '@/domains/activity/model';
import { Result, failure } from '@/shared/result';

export class ActivityService {
  constructor() {}

  async getAll(): Promise<Result<ActivityRecordModel[]>> {
    return failure(new Error('Not implemented'));
  }
}
