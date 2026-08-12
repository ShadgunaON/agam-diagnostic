import { Result } from '../../shared/result';
import { UserProfile } from './model';

export interface IAuthRepository {
  verifyOtp(mobile: string, otp: string, registrationData?: Partial<UserProfile>): Promise<Result<{ success: boolean; isNewUser?: boolean; user?: UserProfile }>>;
  sendOtp(mobile: string): Promise<Result<boolean>>;
  updateProfile(userId: string, data: Partial<UserProfile>): Promise<Result<UserProfile>>;
}
