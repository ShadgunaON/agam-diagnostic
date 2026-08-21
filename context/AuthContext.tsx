"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

import { UserProfile, PatientProfileItem, SavedAddressItem } from '@/domains/auth/model';
import { authService, patientService } from '@/services';
import { SessionStorageAdapter } from '@/lib/storage/SessionStorageAdapter';
import { env } from '@/config/env';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isLoading: boolean;

  signInWithPassword: (email: string, password: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  signUpWithPassword: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; isSignUpComplete?: boolean; error?: string }>;
  confirmSignUp: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;

  sendEmailOtp: (email: string) => Promise<boolean>;
  verifyEmailOtp: (email: string, otp: string, registrationData?: Partial<UserProfile>) => Promise<{ success: boolean; isNewUser?: boolean; user?: UserProfile }>;
  sendOtp: (identifier: string) => Promise<boolean>;
  verifyOtp: (identifier: string, otp: string, registrationData?: Partial<UserProfile>) => Promise<{ success: boolean; isNewUser?: boolean; user?: UserProfile }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  skipProfile: () => Promise<void>;
  addPatient: (patient: Omit<PatientProfileItem, 'id'>) => Promise<void>;
  editPatient: (id: string, patient: Omit<PatientProfileItem, 'id'>) => Promise<void>;
  removePatient: (id: string) => Promise<void>;
  addAddress: (address: Omit<SavedAddressItem, 'id'>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const storageAdapter = React.useMemo(() => new SessionStorageAdapter<UserProfile>('agam_auth_user'), []);

  const saveUserToStateAndStorage = React.useCallback((userData: UserProfile | null) => {
    setUser(userData);
    if (userData) {
      storageAdapter.save(userData);
    } else {
      storageAdapter.clear();
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('cognito_access_token');
        sessionStorage.removeItem('cognito_id_token');
        sessionStorage.removeItem('cognito_refresh_token');
      }
    }
  }, [storageAdapter]);

  const syncPatientData = React.useCallback(async (currentUser: UserProfile) => {
    if (env.useMockData) return currentUser;

    try {
      let updatedUser = { ...currentUser };

      // 1. Sync primary profile from GET /api/patients/me
      const meRes = await patientService.getMe();
      if (meRes.isSuccess && meRes.value) {
        const p = meRes.value;
        updatedUser = {
          ...updatedUser,
          id: p.id || updatedUser.id,
          fullName: p.name || updatedUser.fullName,
          email: p.email || updatedUser.email,
          mobile: p.phone || updatedUser.mobile,
          gender: (p.gender as 'Male' | 'Female' | 'Other') || updatedUser.gender,
          dobOrAge: p.dobOrAge || (p.age ? String(p.age) : updatedUser.dobOrAge),
          isProfileComplete: true,
        };
      }

      // 2. Sync family members from GET /api/patients
      const allPatientsRes = await patientService.getAll(1, 100);
      if (allPatientsRes.isSuccess && allPatientsRes.value.data) {
        const patientsList = allPatientsRes.value.data;
        const familyItems: PatientProfileItem[] = patientsList.map((p) => ({
          id: p.id,
          name: p.name,
          relation: p.relation || (p.id === updatedUser.id ? 'Myself' : 'Family Member'),
          age: String(p.age || '30'),
          gender: (p.gender as 'Male' | 'Female' | 'Other') || 'Male',
        }));

        if (!familyItems.some((f) => f.id === updatedUser.id || f.relation === 'Myself')) {
          familyItems.unshift({
            id: updatedUser.id,
            name: updatedUser.fullName || 'Myself',
            relation: 'Myself',
            age: updatedUser.dobOrAge || '30',
            gender: (updatedUser.gender as 'Male' | 'Female' | 'Other') || 'Male',
          });
        }

        updatedUser.savedPatients = familyItems;
      }

      saveUserToStateAndStorage(updatedUser);
      return updatedUser;
    } catch (err) {
      console.warn('Could not sync patient profile from backend:', err);
      return currentUser;
    }
  }, [saveUserToStateAndStorage]);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const savedUser = storageAdapter.load();
        if (savedUser) {
          setUser(savedUser);
          if (!env.useMockData) {
            await syncPatientData(savedUser);
          }
        }
      } catch (e) {
        console.error('Failed to load auth state from storage', e);
      } finally {
        setIsLoading(false);
      }
    });
  }, [storageAdapter, syncPatientData]);

  const signInWithPassword = async (email: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    const result = await authService.signInWithPassword(email, password);
    if (result.isSuccess) {
      const syncedUser = await syncPatientData(result.value.user);
      saveUserToStateAndStorage(syncedUser);
      return { success: true, user: syncedUser };
    }
    return { success: false, error: result.error.message };
  };

  const signUpWithPassword = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ): Promise<{ success: boolean; isSignUpComplete?: boolean; error?: string }> => {
    const result = await authService.signUpWithPassword(email, password, fullName, phone);
    if (result.isSuccess) {
      return { success: true, isSignUpComplete: result.value.isSignUpComplete };
    }
    return { success: false, error: result.error.message };
  };

  const confirmSignUp = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    const result = await authService.confirmSignUp(email, code);
    if (result.isSuccess) {
      return { success: true };
    }
    return { success: false, error: result.error.message };
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const result = await authService.forgotPassword(email);
    if (result.isSuccess) {
      return { success: true };
    }
    return { success: false, error: result.error.message };
  };

  const confirmForgotPassword = async (
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await authService.confirmForgotPassword(email, code, newPassword);
    if (result.isSuccess) {
      return { success: true };
    }
    return { success: false, error: result.error.message };
  };

  const sendEmailOtp = async (email: string): Promise<boolean> => {
    const result = await authService.sendEmailOtp(email);
    return result.isSuccess ? result.value : false;
  };

  const verifyEmailOtp = async (
    email: string,
    otp: string,
    registrationData?: Partial<UserProfile>
  ): Promise<{ success: boolean; isNewUser?: boolean; user?: UserProfile }> => {
    const result = await authService.verifyEmailOtp(email, otp, registrationData);
    if (result.isSuccess && result.value.success && result.value.user) {
      const syncedUser = await syncPatientData(result.value.user);
      saveUserToStateAndStorage(syncedUser);
      return { success: true, isNewUser: result.value.isNewUser, user: syncedUser };
    }
    return result.isSuccess ? result.value : { success: false };
  };

  const sendOtp = async (identifier: string): Promise<boolean> => {
    return sendEmailOtp(identifier);
  };

  const verifyOtp = async (
    identifier: string,
    otp: string,
    registrationData?: Partial<UserProfile>
  ): Promise<{ success: boolean; isNewUser?: boolean; user?: UserProfile }> => {
    return verifyEmailOtp(identifier, otp, registrationData);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    if (!env.useMockData) {
      await patientService.update(user.id, {
        name: data.fullName || user.fullName,
        email: data.email || user.email,
        phone: data.mobile || user.mobile,
        gender: data.gender || user.gender,
        dobOrAge: data.dobOrAge || user.dobOrAge,
        age: parseInt(data.dobOrAge || '0', 10) || undefined,
      });
    }

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

    if (!env.useMockData) {
      await patientService.create({
        name: patient.name,
        relation: patient.relation,
        age: parseInt(patient.age, 10) || 0,
        gender: patient.gender,
        phone: user.mobile || '',
        email: user.email || '',
        status: 'Active',
        bloodGroup: 'Unknown',
      });
      await syncPatientData(user);
      return;
    }

    // Demo Mode mock handling
    const isDuplicate = user.savedPatients.some(
      (p) => p.name.toLowerCase() === patient.name.toLowerCase() && p.relation === patient.relation
    );
    if (isDuplicate) {
      console.warn('Duplicate family member detected');
      return;
    }

    const patientResult = await patientService.create({
      name: patient.name,
      age: parseInt(patient.age, 10) || 0,
      gender: patient.gender,
      phone: user.mobile,
      email: user.email || '',
      status: 'Active',
      bloodGroup: 'Unknown',
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

    if (!env.useMockData) {
      await patientService.update(id, {
        name: patient.name,
        relation: patient.relation,
        age: parseInt(patient.age, 10) || 0,
        gender: patient.gender,
      });
      await syncPatientData(user);
      return;
    }

    // Demo Mode mock handling
    if (!id.startsWith('pat_')) {
      await patientService.update(id, {
        name: patient.name,
        age: parseInt(patient.age, 10) || 0,
        gender: patient.gender,
      });
    }

    const updatedPatients = user.savedPatients.map((p) =>
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

    if (!env.useMockData) {
      await patientService.update(id, {
        status: 'Inactive',
      });
      await syncPatientData(user);
      return;
    }

    // Demo Mode mock handling
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

        signInWithPassword,
        signUpWithPassword,
        confirmSignUp,
        forgotPassword,
        confirmForgotPassword,

        sendEmailOtp,
        verifyEmailOtp,
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
