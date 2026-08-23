export type UserRole = 'patient' | 'admin' | 'op' | 'path' | 'phleb' | 'phleb_home' | 'phleb_lab' | 'doctor' | 'lab_tech';

export interface PatientProfileItem {
  id: string;
  name: string;
  relation: string;
  age: string;
  gender: string;
}

export interface SavedAddressItem {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  mobile: string;
  email?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dobOrAge?: string;
  role: UserRole;
  staffId?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContact?: string;
  alternateMobile?: string;
  height?: string;
  weight?: string;
  existingConditions?: string;
  preferredAddress?: string;
  isProfileComplete?: boolean;
  savedPatients: PatientProfileItem[];
  savedAddresses: SavedAddressItem[];
}
