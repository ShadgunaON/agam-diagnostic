export type PatientStatus = 'Active' | 'Inactive';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  lastVisit: string;
  totalBookings: number;
  status: PatientStatus;
  bloodGroup: string;
}

export const mockPatients: Patient[] = [
  {
    id: 'PT-2023-001',
    name: 'Rahul Sharma',
    age: 45,
    gender: 'Male',
    phone: '+91 98765 43210',
    email: 'rahul.s@example.com',
    lastVisit: 'Oct 12, 2026',
    totalBookings: 12,
    status: 'Active',
    bloodGroup: 'O+'
  },
  {
    id: 'PT-2023-002',
    name: 'Priya Patel',
    age: 32,
    gender: 'Female',
    phone: '+91 91234 56789',
    email: 'priya.p@example.com',
    lastVisit: 'Oct 13, 2026',
    totalBookings: 4,
    status: 'Active',
    bloodGroup: 'A+'
  },
  {
    id: 'PT-2023-003',
    name: 'Anil Kumar',
    age: 58,
    gender: 'Male',
    phone: '+91 99887 76655',
    email: 'anil.k@example.com',
    lastVisit: 'Oct 14, 2026',
    totalBookings: 24,
    status: 'Active',
    bloodGroup: 'B+'
  },
  {
    id: 'PT-2023-004',
    name: 'Meera Reddy',
    age: 28,
    gender: 'Female',
    phone: '+91 98765 12345',
    email: 'meera.r@example.com',
    lastVisit: 'Oct 10, 2026',
    totalBookings: 2,
    status: 'Inactive',
    bloodGroup: 'AB+'
  },
  {
    id: 'PT-2023-005',
    name: 'Suresh Menon',
    age: 62,
    gender: 'Male',
    phone: '+91 94444 33333',
    email: 'suresh.m@example.com',
    lastVisit: 'Oct 12, 2026',
    totalBookings: 31,
    status: 'Active',
    bloodGroup: 'O-'
  },
  {
    id: 'PT-2023-006',
    name: 'Kavita Singh',
    age: 35,
    gender: 'Female',
    phone: '+91 90000 11111',
    email: 'kavita.s@example.com',
    lastVisit: 'Oct 08, 2026',
    totalBookings: 8,
    status: 'Active',
    bloodGroup: 'A-'
  },
  {
    id: 'PT-2023-007',
    name: 'Vikram Joshi',
    age: 41,
    gender: 'Male',
    phone: '+91 91111 22222',
    email: 'vikram.j@example.com',
    lastVisit: 'Oct 17, 2026',
    totalBookings: 15,
    status: 'Active',
    bloodGroup: 'B-'
  },
  {
    id: 'PT-2023-008',
    name: 'Anita Desai',
    age: 50,
    gender: 'Female',
    phone: '+91 92222 33333',
    email: 'anita.d@example.com',
    lastVisit: 'Sep 25, 2026',
    totalBookings: 6,
    status: 'Inactive',
    bloodGroup: 'O+'
  },
  {
    id: 'PT-2023-009',
    name: 'Rajeev Nair',
    age: 29,
    gender: 'Male',
    phone: '+91 93333 44444',
    email: 'rajeev.n@example.com',
    lastVisit: 'Oct 05, 2026',
    totalBookings: 3,
    status: 'Active',
    bloodGroup: 'AB-'
  },
  {
    id: 'PT-2023-010',
    name: 'Sneha Gupta',
    age: 38,
    gender: 'Female',
    phone: '+91 95555 66666',
    email: 'sneha.g@example.com',
    lastVisit: 'Aug 14, 2026',
    totalBookings: 1,
    status: 'Inactive',
    bloodGroup: 'A+'
  },
];
