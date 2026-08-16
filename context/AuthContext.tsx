"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

import { UserProfile, PatientProfileItem, SavedAddressItem } from '@/domains/auth/model';
import { authService, patientService } from '@/services';
import { SessionStorageAdapter } from '@/lib/storage/SessionStorageAdapter';



interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isLoading: boolean;

  sendOtp: (mobile: string) => Promise<boolean>;
  verifyOtp: (mobile: string, otp: string, registrationData?: Partial<UserProfile>) => Promise<{ success: boolean; isNewUser?: boolean; user?: UserProfile }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  skipProfile: () => Promise<void>;
  addPatient: (patient: Omit<PatientProfileItem, 'id'>) => Promise<void>;
  editPatient: (id: string, patient: Omit<PatientProfileItem, 'id'>) => Promise<void>;
  removePatient: (id: string) => Promise<void>;
  addAddress: (address: Omit<SavedAddressItem, 'id'>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// PRESEEDED_EXISTING_USER moved to MockAuthRepository

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const storageAdapter = React.useMemo(() => new SessionStorageAdapter<UserProfile>('agam_auth_user'), []);


  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedUser = storageAdapter.load();
        if (savedUser) {
          setUser(savedUser);
        }
      } catch (e) {
        console.error('Failed to load auth state from localStorage', e);
      } finally {
        setIsLoading(false);
      }
    });
  }, [storageAdapter]);

  const saveUserToStateAndStorage = (userData: UserProfile | null) => {
    setUser(userData);
    if (userData) {
      storageAdapter.save(userData);
    } else {
      storageAdapter.clear();
    }
  };

  const sendOtp = async (mobile: string): Promise<boolean> => {
    const result = await authService.sendOtp(mobile);
    return result.isSuccess ? result.value : false;
  };

  const verifyOtp = async (
    mobile: string,
    otp: string,
    registrationData?: Partial<UserProfile>
  ): Promise<{ success: boolean; isNewUser?: boolean; user?: UserProfile }> => {
    const result = await authService.verifyOtp(mobile, otp, registrationData);
    if (result.isSuccess && result.value.success && result.value.user) {
      saveUserToStateAndStorage(result.value.user);
    }
    return result.isSuccess ? result.value : { success: false };
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const result = await authService.updateProfile(user.id, { ...data, isProfileComplete: true });
    if (result.isSuccess) {
      saveUserToStateAndStorage(result.value);
    }
  };

  const skipProfile = async () => {
    if (!user) return;
    const result = await authService.updateProfile(user.id, { isProfileComplete: false });
    if (result.isSuccess) {
      saveUserToStateAndStorage(result.value);
    }
  };

  const addPatient = async (patient: Omit<PatientProfileItem, 'id'>) => {
    if (!user) return;

    // Duplicate check
    const isDuplicate = user.savedPatients.some(
      p => p.name.toLowerCase() === patient.name.toLowerCase() && p.relation === patient.relation
    );
    if (isDuplicate) {
      console.warn('Duplicate family member detected');
      return;
    }

    // Create a canonical patient via patientService
    const patientResult = await patientService.create({
      name: patient.name,
      age: parseInt(patient.age) || 0,
      gender: patient.gender,
      phone: user.mobile,
      email: user.email || '',
      status: 'Active',
      bloodGroup: 'Unknown'
    });

    const newPatientItem: PatientProfileItem = {
      ...patient,
      id: patientResult.isSuccess ? patientResult.value.id : `pat_${Date.now()}`,
    };
    const result = await authService.updateProfile(user.id, {
      savedPatients: [...user.savedPatients, newPatientItem],
    });
    if (result.isSuccess) {
      saveUserToStateAndStorage(result.value);
    }
  };

  const editPatient = async (id: string, patient: Omit<PatientProfileItem, 'id'>) => {
    if (!user) return;
    
    // Update canonical patient via patientService
    if (!id.startsWith('pat_')) {
      await patientService.update(id, {
        name: patient.name,
        age: parseInt(patient.age) || 0,
        gender: patient.gender
      });
    }

    const updatedPatients = user.savedPatients.map(p => 
      p.id === id ? { ...patient, id } : p
    );
    
    const result = await authService.updateProfile(user.id, {
      savedPatients: updatedPatients,
    });
    
    if (result.isSuccess) {
      saveUserToStateAndStorage(result.value);
    }
  };

  const removePatient = async (id: string) => {
    if (!user) return;
    const result = await authService.updateProfile(user.id, {
      savedPatients: user.savedPatients.filter((p) => p.id !== id),
    });
    if (result.isSuccess) {
      saveUserToStateAndStorage(result.value);
    }
  };

  const addAddress = async (address: Omit<SavedAddressItem, 'id'>) => {
    if (!user) return;
    const newAddressItem: SavedAddressItem = {
      ...address,
      id: `addr_${Date.now()}`,
    };
    const result = await authService.updateProfile(user.id, {
      address: address.addressLine,
      city: address.city,
      pincode: address.pincode,
      preferredAddress: `${address.addressLine}, ${address.city} - ${address.pincode}`,
      savedAddresses: [...user.savedAddresses, newAddressItem],
    });
    if (result.isSuccess) {
      saveUserToStateAndStorage(result.value);
    }
  };

  const logout = () => {
    saveUserToStateAndStorage(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isProfileComplete: !!user?.isProfileComplete,
        isLoading,

        sendOtp,
        verifyOtp,
        updateProfile,
        skipProfile,
        addPatient,
        editPatient,
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
