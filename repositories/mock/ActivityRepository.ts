import { IActivityRepository } from '@/domains/activity/repository';
import { ActivityRecordModel } from '@/domains/activity/model';
import { Result, success } from '@/shared/result';
import { mockActivityFeed } from '@/data/activity';

export class MockActivityRepository implements IActivityRepository {
  async getAll(): Promise<Result<ActivityRecordModel[]>> {
    return success(mockActivityFeed);
  }
}
