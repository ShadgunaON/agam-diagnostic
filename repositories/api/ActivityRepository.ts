import { IActivityRepository } from '@/domains/activity/repository';
import { ActivityRecordModel } from '@/domains/activity/model';
import { Result, failure } from '@/shared/result';
import { ServerError } from '@/lib/api/errors';
import { IApiClient } from '@/lib/api/client';

export class ApiActivityRepository implements IActivityRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getAll(): Promise<Result<ActivityRecordModel[]>> {
    return failure(new ServerError('Not implemented'));
  }
}
