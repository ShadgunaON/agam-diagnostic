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
    void _mobile;
    void _otp;
    void _registrationData;
    return failure(new ServerError('Auth API not implemented'));
  }
}
