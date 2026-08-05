"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'patient' | 'doctor' | 'lab_tech' | 'admin';

export interface PatientProfileItem {
  id: string;
  name: string;
  relation: string; // 'Myself' | 'Spouse' | 'Mother' | 'Father' | 'Child' | 'Other'
  age: string;
  gender: string;
}

export interface SavedAddressItem {
  id: string;
  label: string; // e.g. 'Home', 'Office'
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
  // Extended Profile Fields
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

export interface ReturnIntentData {
  previousUrl: string;
  bookingStep?: number;
  selectedPatientId?: string;
  selectedCollectionType?: 'home' | 'lab';
  selectedAddressId?: string;
  selectedDate?: string;
  selectedSlotId?: string;
  selectedPaymentMethod?: 'cash' | 'upi' | 'card';
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isLoading: boolean;
  returnIntent: ReturnIntentData | null;
  setReturnIntent: (intent: ReturnIntentData | null) => void;
  sendOtp: (mobile: string) => Promise<boolean>;
  verifyOtp: (mobile: string, otp: string, registrationData?: Partial<UserProfile>) => Promise<{ success: boolean; isNewUser?: boolean }>;
  updateProfile: (data: Partial<UserProfile>) => void;
  skipProfile: () => void;
  addPatient: (patient: Omit<PatientProfileItem, 'id'>) => void;
  removePatient: (id: string) => void;
  addAddress: (address: Omit<SavedAddressItem, 'id'>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRESEEDED_EXISTING_USER: UserProfile = {
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [returnIntent, setReturnIntentState] = useState<ReturnIntentData | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedUser = localStorage.getItem('agam_auth_user');
        const savedIntent = localStorage.getItem('agam_return_intent');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        if (savedIntent) {
          setReturnIntentState(JSON.parse(savedIntent));
        }
      } catch (e) {
        console.error('Failed to load auth state from localStorage', e);
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  const saveUserToStateAndStorage = (userData: UserProfile | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('agam_auth_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('agam_auth_user');
    }
  };

  const setReturnIntent = (intent: ReturnIntentData | null) => {
    setReturnIntentState(intent);
    if (intent) {
      localStorage.setItem('agam_return_intent', JSON.stringify(intent));
    } else {
      localStorage.removeItem('agam_return_intent');
    }
  };

  const sendOtp = async (_mobile: string): Promise<boolean> => {
    void _mobile;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
  };

  const verifyOtp = async (
    mobile: string,
    otp: string,
    registrationData?: Partial<UserProfile>
  ): Promise<{ success: boolean; isNewUser?: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 700));

    if (otp !== '1234' && otp.length !== 4) {
      return { success: false };
    }

    if (registrationData && registrationData.fullName) {
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        fullName: registrationData.fullName,
        mobile,
        email: registrationData.email || '',
        gender: registrationData.gender || 'Male',
        dobOrAge: registrationData.dobOrAge || '',
        role: 'patient',
        isProfileComplete: false,
        savedPatients: [
          { id: `pat_${Date.now()}`, name: registrationData.fullName, relation: 'Myself', age: registrationData.dobOrAge || '30', gender: registrationData.gender || 'Male' }
        ],
        savedAddresses: [],
      };
      saveUserToStateAndStorage(newUser);
      return { success: true, isNewUser: true };
    }

    if (mobile === '9876543210' || mobile === PRESEEDED_EXISTING_USER.mobile) {
      saveUserToStateAndStorage(PRESEEDED_EXISTING_USER);
      return { success: true, isNewUser: false };
    }

    const genericUser: UserProfile = {
      id: `usr_${mobile}`,
      fullName: 'Agam Patient',
      mobile,
      role: 'patient',
      isProfileComplete: false,
      savedPatients: [
        { id: `pat_${mobile}`, name: 'Agam Patient', relation: 'Myself', age: '30', gender: 'Male' }
      ],
      savedAddresses: [],
    };
    saveUserToStateAndStorage(genericUser);
    return { success: true, isNewUser: false };
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      ...data,
      isProfileComplete: true,
    };
    saveUserToStateAndStorage(updatedUser);
  };

  const skipProfile = () => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      isProfileComplete: false,
    };
    saveUserToStateAndStorage(updatedUser);
  };

  const addPatient = (patient: Omit<PatientProfileItem, 'id'>) => {
    if (!user) return;
    const newPatientItem: PatientProfileItem = {
      ...patient,
      id: `pat_${Date.now()}`,
    };
    const updatedUser: UserProfile = {
      ...user,
      savedPatients: [...user.savedPatients, newPatientItem],
    };
    saveUserToStateAndStorage(updatedUser);
  };

  const removePatient = (id: string) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      savedPatients: user.savedPatients.filter((p) => p.id !== id),
    };
    saveUserToStateAndStorage(updatedUser);
  };

  const addAddress = (address: Omit<SavedAddressItem, 'id'>) => {
    if (!user) return;
    const newAddressItem: SavedAddressItem = {
      ...address,
      id: `addr_${Date.now()}`,
    };
    const updatedUser: UserProfile = {
      ...user,
      address: address.addressLine,
      city: address.city,
      pincode: address.pincode,
      preferredAddress: `${address.addressLine}, ${address.city} - ${address.pincode}`,
      savedAddresses: [...user.savedAddresses, newAddressItem],
    };
    saveUserToStateAndStorage(updatedUser);
  };

  const logout = () => {
    saveUserToStateAndStorage(null);
    setReturnIntent(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isProfileComplete: !!user?.isProfileComplete,
        isLoading,
        returnIntent,
        setReturnIntent,
        sendOtp,
        verifyOtp,
        updateProfile,
        skipProfile,
        addPatient,
        removePatient,
        addAddress,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
