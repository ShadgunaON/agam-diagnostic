import { IAuthRepository } from '@/domains/auth/repository';
import { UserProfile } from '@/domains/auth/model';

export class AuthService {
  constructor(private readonly repository: IAuthRepository) {}

  async signInWithPassword(email: string, password: string) {
    return this.repository.signInWithPassword(email, password);
  }

  async completeNewPasswordChallenge(email: string, newPassword: string, session: string) {
    return this.repository.completeNewPasswordChallenge(email, newPassword, session);
  }

  async signUpWithPassword(email: string, password: string, fullName: string, phone?: string) {
    return this.repository.signUpWithPassword(email, password, fullName, phone);
  }

  async confirmSignUp(email: string, code: string) {
    return this.repository.confirmSignUp(email, code);
  }

  async forgotPassword(email: string) {
    return this.repository.forgotPassword(email);
  }

  async confirmForgotPassword(email: string, code: string, newPassword: string) {
    return this.repository.confirmForgotPassword(email, code, newPassword);
  }

  async sendEmailOtp(email: string) {
    return this.repository.sendEmailOtp(email);
  }

  async verifyEmailOtp(email: string, otp: string, registrationData?: Partial<UserProfile>) {
    return this.repository.verifyEmailOtp(email, otp, registrationData);
  }

  async sendOtp(identifier: string) {
    return this.repository.sendOtp(identifier);
  }

  async verifyOtp(identifier: string, otp: string, registrationData?: Partial<UserProfile>) {
    return this.repository.verifyOtp(identifier, otp, registrationData);
  }

  async updateProfile(userId: string, data: Partial<UserProfile>) {
    return this.repository.updateProfile(userId, data);
  }

  async createMockAccount(user: UserProfile) {
    return this.repository.createMockAccount(user);
  }
}
