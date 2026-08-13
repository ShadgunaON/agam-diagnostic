import { IAuthRepository } from '@/domains/auth/repository';
import { UserProfile } from '@/domains/auth/model';
import { Result, success } from '@/shared/result';

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

const memoryUsers: Map<string, UserProfile> = new Map();
memoryUsers.set(PRESEEDED_EXISTING_USER.id, PRESEEDED_EXISTING_USER);
memoryUsers.set(ADMIN_USER.id, ADMIN_USER);
memoryUsers.set(PHLEBOTOMIST_USER.id, PHLEBOTOMIST_USER);
memoryUsers.set(LAB_TECH_USER.id, LAB_TECH_USER);
memoryUsers.set(PHLEBOTOMIST_USER_2.id, PHLEBOTOMIST_USER_2);
memoryUsers.set(LAB_TECH_USER_2.id, LAB_TECH_USER_2);

export class MockAuthRepository implements IAuthRepository {
  async sendOtp(_mobile: string): Promise<Result<boolean>> {
    return success(true);
  }

  async verifyOtp(mobile: string, otp: string, registrationData?: Partial<UserProfile>): Promise<Result<{ success: boolean; isNewUser?: boolean; user?: UserProfile }>> {
    if (otp !== '1234' && otp.length !== 4) {
      return success({ success: false });
    }

    // Check all preseeded users by mobile number
    const preseededUser = Array.from(memoryUsers.values()).find(u => u.mobile === mobile);
    if (preseededUser) {
      return success({ success: true, isNewUser: false, user: preseededUser });
    }

    const newUser: UserProfile = {
      id: `usr_${mobile}`,
      fullName: registrationData?.fullName || '',
      mobile,
      email: registrationData?.email || '',
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
        gender: newUser.gender || 'Male' 
      });
    }

    memoryUsers.set(newUser.id, newUser);
    return success({ success: true, isNewUser: true, user: newUser });
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<Result<UserProfile>> {
    const memUser = memoryUsers.get(userId);
    if (memUser) {
      Object.assign(memUser, data);
      return success(memUser);
    }
    
    const mockUpdatedUser = { id: userId, role: 'patient', ...data } as UserProfile;
    memoryUsers.set(userId, mockUpdatedUser);
    return success(mockUpdatedUser);
  }
}
