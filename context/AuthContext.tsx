"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

import { UserProfile, PatientProfileItem, SavedAddressItem } from '@/domains/auth/model';
import { authService } from '@/services';
import { LocalStorageAdapter } from '@/lib/storage/LocalStorageAdapter';



interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isLoading: boolean;

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

// PRESEEDED_EXISTING_USER moved to MockAuthRepository

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const storageAdapter = React.useMemo(() => new LocalStorageAdapter<UserProfile>('agam_auth_user'), []);


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
  ): Promise<{ success: boolean; isNewUser?: boolean }> => {
    const result = await authService.verifyOtp(mobile, otp, registrationData);
    if (result.isSuccess && result.value.success && result.value.user) {
      saveUserToStateAndStorage(result.value.user);
    }
    return result.isSuccess ? result.value : { success: false };
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
