import { IAuthRepository } from '@/domains/auth/repository';
import { AuthModel } from '@/domains/auth/model';
import { Result, failure } from '@/shared/result';
import { ServerError } from '@/lib/api/errors';
import { IApiClient } from '@/lib/api/client';

export class ApiAuthRepository implements IAuthRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getById(_id: string): Promise<Result<AuthModel>> {
    void _id;
    return failure(new ServerError('Auth API not implemented'));
  }
}
