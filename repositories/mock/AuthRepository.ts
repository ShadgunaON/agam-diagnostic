import { IAuthRepository } from '@/domains/auth/repository';
import { UserProfile } from '@/domains/auth/model';
import { Result, success, failure } from '@/shared/result';
import { SharedMockAdapter } from '@/lib/storage/SharedMockAdapter';
import { ValidationError, NotFoundError } from '@/lib/api/errors';

export const PRESEEDED_EXISTING_USER: UserProfile = {
  id: 'usr_existing_1',
  fullName: 'John Doe',
  mobile: '9876543210',
  email: 'john.doe@example.com',
  gender: 'Male',
  dobOrAge: '32',
  role: 'patient',
  address: 'Plot No 12, Anna Nagar Main Road',
  city: 'Madurai',
  state: 'Tamil Nadu',
  pincode: '625020',
  emergencyContact: '9876543211',
  preferredAddress: 'Plot No 12, Anna Nagar Main Road, Madurai - 625020',
  isProfileComplete: true,
  savedPatients: [
    { id: 'pat_1', name: 'John Doe', relation: 'Myself', age: '32', gender: 'Male' },
    { id: 'pat_2', name: 'Anita Doe', relation: 'Spouse', age: '30', gender: 'Female' },
    { id: 'pat_3', name: 'Ramanathan Doe', relation: 'Father', age: '64', gender: 'Male' },
  ],
  savedAddresses: [
    { id: 'addr_1', label: 'Home', addressLine: 'Plot No 12, Anna Nagar Main Road', city: 'Madurai', pincode: '625020', isDefault: true },
    { id: 'addr_2', label: 'Parents House', addressLine: 'Door 45, KK Nagar 2nd Street', city: 'Madurai', pincode: '625020' },
  ],
};

export const ADMIN_USER: UserProfile = {
  id: 'usr_admin_1',
  fullName: 'Admin User',
  mobile: '9999999999',
  email: 'admin@agamdiagnostics.com',
  role: 'admin',
  staffId: 'EMP-001',
  isProfileComplete: true,
  savedPatients: [],
  savedAddresses: [],
};

// Demo Staff: Phlebotomist (linked to EMP-002 in staff data)
export const PHLEBOTOMIST_USER: UserProfile = {
  id: 'usr_phleb_1',
  fullName: 'Sunita Rao',
  mobile: '1111111111',
  email: 'sunita.r@agam.com',
  role: 'lab_tech',
  staffId: 'EMP-002',
  isProfileComplete: true,
  savedPatients: [],
  savedAddresses: [],
};

// Demo Staff: Lab Technician (linked to EMP-003 in staff data)
export const LAB_TECH_USER: UserProfile = {
  id: 'usr_labtech_1',
  fullName: 'Karan Malhotra',
  mobile: '2222222222',
  email: 'karan.m@agam.com',
  role: 'lab_tech',
  staffId: 'EMP-003',
  isProfileComplete: true,
  savedPatients: [],
  savedAddresses: [],
};

export const PHLEBOTOMIST_USER_2: UserProfile = {
  id: 'usr_phleb_2',
  fullName: 'Ramesh Singh',
  mobile: '3333333333',
  email: 'ramesh.s@agam.com',
  role: 'lab_tech',
  staffId: 'EMP-005',
  isProfileComplete: true,
  savedPatients: [],
  savedAddresses: [],
};

export const LAB_TECH_USER_2: UserProfile = {
  id: 'usr_labtech_2',
  fullName: 'Vikash Kumar',
  mobile: '4444444444',
  email: 'vikash.k@agam.com',
  role: 'lab_tech',
  staffId: 'EMP-007',
  isProfileComplete: true,
  savedPatients: [],
  savedAddresses: [],
};

const preseededUsers: UserProfile[] = [
  PRESEEDED_EXISTING_USER,
  ADMIN_USER,
  PHLEBOTOMIST_USER,
  PHLEBOTOMIST_USER_2,
  LAB_TECH_USER,
  LAB_TECH_USER_2,
];

export class MockAuthRepository implements IAuthRepository {
  private adapter: SharedMockAdapter<UserProfile[]>;

  constructor() {
    this.adapter = new SharedMockAdapter<UserProfile[]>('agam_mock_users_state');
  }

  private async getUsers(): Promise<UserProfile[]> {
    const loaded = await this.adapter.load();
    if (loaded && loaded.length > 0) {
      return loaded;
    }
    return [...preseededUsers];
  }

  private async saveUsers(users: UserProfile[]): Promise<void> {
    await this.adapter.save(users);
  }

  async signInWithPassword(
    email: string,
    _password: string
  ): Promise<Result<{ user: UserProfile; accessToken: string }>> {
    const users = await this.getUsers();
    const foundUser = users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase() || u.mobile === email
    );

    if (foundUser) {
      return success({
        user: foundUser,
        accessToken: `mock_jwt_token_${foundUser.id}`,
      });
    }

    // Allow arbitrary demo email sign-in for testing
    const demoUser: UserProfile = {
      id: `usr_${Date.now()}`,
      fullName: email.split('@')[0] || 'Demo User',
      email,
      mobile: '9876543210',
      role: 'patient',
      isProfileComplete: true,
      savedPatients: [
        {
          id: `pat_${Date.now()}`,
          name: email.split('@')[0] || 'Demo User',
          relation: 'Myself',
          age: '30',
          gender: 'Male',
        },
      ],
      savedAddresses: [],
    };

    users.push(demoUser);
    await this.saveUsers(users);
    return success({
      user: demoUser,
      accessToken: `mock_jwt_token_${demoUser.id}`,
    });
  }

  async completeNewPasswordChallenge(
    _email: string,
    _newPassword: string,
    _session: string
  ): Promise<Result<{ user: UserProfile; accessToken: string }>> {
    // Mock mode: no real Cognito challenge — return failure
    return failure(new ValidationError('New password challenge is not supported in mock mode.'));
  }

  async signUpWithPassword(
    email: string,
    _password: string,
    fullName: string,
    phone?: string
  ): Promise<Result<{ isSignUpComplete: boolean; userId?: string }>> {
    const users = await this.getUsers();
    const existing = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (existing) {
      return failure(new ValidationError('An account with this email address already exists.'));
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      fullName,
      email,
      mobile: phone || '',
      role: 'patient',
      isProfileComplete: true,
      savedPatients: [
        {
          id: `pat_${Date.now()}`,
          name: fullName,
          relation: 'Myself',
          age: '30',
          gender: 'Male',
        },
      ],
      savedAddresses: [],
    };

    users.push(newUser);
    await this.saveUsers(users);
    return success({ isSignUpComplete: true, userId: newUser.id });
  }

  async confirmSignUp(_email: string, _code: string): Promise<Result<boolean>> {
    return success(true);
  }

  async forgotPassword(email: string): Promise<Result<boolean>> {
    const users = await this.getUsers();
    const existing = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!existing) {
      return failure(new NotFoundError('No account found with this email address.'));
    }
    return success(true);
  }

  async confirmForgotPassword(
    _email: string,
    _code: string,
    _newPassword: string
  ): Promise<Result<boolean>> {
    return success(true);
  }

  async sendEmailOtp(_email: string): Promise<Result<boolean>> {
    return success(true);
  }

  async verifyEmailOtp(
    email: string,
    otp: string,
    registrationData?: Partial<UserProfile>
  ): Promise<Result<{ success: boolean; isNewUser?: boolean; user?: UserProfile }>> {
    if (otp !== '1234' && otp !== '123456' && otp.length !== 4 && otp.length !== 6) {
      return success({ success: false });
    }

    const users = await this.getUsers();
    const preseededUser = users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase() || u.mobile === email
    );
    if (preseededUser) {
      return success({ success: true, isNewUser: false, user: preseededUser });
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      fullName: registrationData?.fullName || '',
      mobile: registrationData?.mobile || '',
      email,
      gender: registrationData?.gender || undefined,
      dobOrAge: registrationData?.dobOrAge || '',
      role: 'patient',
      isProfileComplete: false,
      savedPatients: [],
      savedAddresses: [],
    };

    if (newUser.fullName) {
      newUser.savedPatients.push({
        id: `pat_${Date.now()}`,
        name: newUser.fullName,
        relation: 'Myself',
        age: newUser.dobOrAge || '30',
        gender: newUser.gender || 'Male',
      });
    }

    users.push(newUser);
    await this.saveUsers(users);
    return success({ success: true, isNewUser: true, user: newUser });
  }

  async sendOtp(identifier: string): Promise<Result<boolean>> {
    return this.sendEmailOtp(identifier);
  }

  async verifyOtp(
    identifier: string,
    otp: string,
    registrationData?: Partial<UserProfile>
  ): Promise<Result<{ success: boolean; isNewUser?: boolean; user?: UserProfile }>> {
    return this.verifyEmailOtp(identifier, otp, registrationData);
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<Result<UserProfile>> {
    const users = await this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      const updatedUser = { ...users[index], ...data };
      users[index] = updatedUser;
      await this.saveUsers(users);
      return success(updatedUser);
    }

    return failure(new Error('User not found'));
  }

  async createMockAccount(user: UserProfile): Promise<Result<void>> {
    const users = await this.getUsers();
    const index = users.findIndex((u) => u.mobile === user.mobile);
    if (index !== -1) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    await this.saveUsers(users);
    return success(undefined);
  }
}
