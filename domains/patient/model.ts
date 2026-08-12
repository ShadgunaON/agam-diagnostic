export type PatientStatus = 'Active' | 'Inactive';

export interface PatientModel {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other' | string;
  phone: string;
  email: string;
  status: PatientStatus;
  bloodGroup: string;
  createdAt?: string;
  updatedAt?: string;
}
