import { IAuthRepository } from '@/domains/auth/repository';
import { AuthModel } from '@/domains/auth/model';
import { Result, failure } from '@/shared/result';
import { ServerError } from '@/lib/api/errors';

export class MockAuthRepository implements IAuthRepository {
  async getById(_id: string): Promise<Result<AuthModel>> {
    void _id;
    return failure(new ServerError('Auth mock not implemented'));
  }
}
