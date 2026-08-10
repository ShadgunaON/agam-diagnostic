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

export class MockAuthRepository implements IAuthRepository {
  async sendOtp(_mobile: string): Promise<Result<boolean>> {
    return success(true);
  }

  async verifyOtp(mobile: string, otp: string, registrationData?: Partial<UserProfile>): Promise<Result<{ success: boolean; isNewUser?: boolean; user?: UserProfile }>> {
    if (otp !== '1234' && otp.length !== 4) {
      return success({ success: false });
    }

    if (mobile === '9876543210' || mobile === PRESEEDED_EXISTING_USER.mobile) {
      return success({ success: true, isNewUser: false, user: PRESEEDED_EXISTING_USER });
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

    return success({ success: true, isNewUser: true, user: newUser });
  }
}
