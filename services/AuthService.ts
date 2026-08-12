import { IAuthRepository } from '@/domains/auth/repository';
import { UserProfile } from '@/domains/auth/model';

export class AuthService {
  constructor(private readonly repository: IAuthRepository) {}

  async sendOtp(mobile: string) {
    return this.repository.sendOtp(mobile);
  }

  async verifyOtp(mobile: string, otp: string, registrationData?: Partial<UserProfile>) {
    return this.repository.verifyOtp(mobile, otp, registrationData);
  }

  async updateProfile(userId: string, data: Partial<UserProfile>) {
    return this.repository.updateProfile(userId, data);
  }
}
