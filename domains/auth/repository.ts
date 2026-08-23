import { Result } from '../../shared/result';
import { UserProfile } from './model';

export interface IAuthRepository {
  // Password-based authentication (P3C.4)
  signInWithPassword(email: string, password: string): Promise<Result<{ user: UserProfile; accessToken: string } | { needsNewPassword: true; session: string; email: string }>>;
  completeNewPasswordChallenge(email: string, newPassword: string, session: string): Promise<Result<{ user: UserProfile; accessToken: string }>>;
  signUpWithPassword(email: string, password: string, fullName: string, phone?: string): Promise<Result<{ isSignUpComplete: boolean; userId?: string }>>;
  confirmSignUp(email: string, code: string): Promise<Result<boolean>>;
  forgotPassword(email: string): Promise<Result<boolean>>;
  confirmForgotPassword(email: string, code: string, newPassword: string): Promise<Result<boolean>>;

  // Existing Email OTP methods (preserved)
  sendEmailOtp(email: string): Promise<Result<boolean>>;
  verifyEmailOtp(email: string, otp: string, registrationData?: Partial<UserProfile>): Promise<Result<{ success: boolean; isNewUser?: boolean; user?: UserProfile }>>;
  verifyOtp(identifier: string, otp: string, registrationData?: Partial<UserProfile>): Promise<Result<{ success: boolean; isNewUser?: boolean; user?: UserProfile }>>;
  sendOtp(identifier: string): Promise<Result<boolean>>;
  updateProfile(userId: string, data: Partial<UserProfile>): Promise<Result<UserProfile>>;
  createMockAccount(user: UserProfile): Promise<Result<void>>;
}

