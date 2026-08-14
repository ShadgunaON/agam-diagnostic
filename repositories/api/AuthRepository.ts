import { IAuthRepository } from '@/domains/auth/repository';
import { UserProfile } from '@/domains/auth/model';
import { Result, failure } from '@/shared/result';
import { ServerError } from '@/lib/api/errors';
import { IApiClient } from '@/lib/api/client';

export class ApiAuthRepository implements IAuthRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async sendOtp(_mobile: string): Promise<Result<boolean>> {
    void _mobile;
    return failure(new ServerError('Auth API not implemented'));
  }

  async verifyOtp(_mobile: string, _otp: string, _registrationData?: Partial<UserProfile>): Promise<Result<{ success: boolean; isNewUser?: boolean; user?: UserProfile }>> {
    // For now, always return failure as this is not implemented in the API layer yet.
    return failure(new Error('API Auth verification not implemented'));
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<Result<UserProfile>> {
    // For now, always return failure as this is not implemented in the API layer yet.
    return failure(new Error('API Auth profile update not implemented'));
  }

  async createMockAccount(_user: UserProfile): Promise<Result<void>> {
    return failure(new Error('API Auth mock account creation not implemented'));
  }
}
