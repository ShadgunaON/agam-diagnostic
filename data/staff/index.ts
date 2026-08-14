export type StaffStatus = 'On Duty' | 'Off Duty' | 'On Leave';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  shift: string;
  status: StaffStatus;
  joinDate: string;
}

export const mockStaff: StaffMember[] = [
  {
    id: 'EMP-001',
    name: 'Siddhi',
    role: 'admin',
    department: 'Management',
    phone: '+91 99999 99999',
    email: 'siddhi@agamdiagnostics.com',
    shift: '09:00 AM - 05:00 PM',
    status: 'On Duty',
    joinDate: 'Jan 15, 2021'
  },
  {
    id: 'EMP-002',
    name: 'Sunita Rao',
    role: 'phleb_home',
    department: 'Sample Collection',
    phone: '+91 11111 11111',
    email: 'sunita.r@agamdiagnostics.com',
    shift: '07:00 AM - 03:00 PM',
    status: 'On Duty',
    joinDate: 'Mar 10, 2022'
  },
  {
    id: 'EMP-003',
    name: 'Neha Gupta',
    role: 'op',
    department: 'Front Desk',
    phone: '+91 92233 44556',
    email: 'neha.g@agamdiagnostics.com',
    shift: '08:00 AM - 04:00 PM',
    status: 'On Duty',
    joinDate: 'Nov 05, 2023'
  },
  {
    id: 'EMP-004',
    name: 'Dr. Meenakshi Iyer',
    role: 'path',
    department: 'Microbiology',
    phone: '+91 94455 66778',
    email: 'meenakshi.i@agamdiagnostics.com',
    shift: '10:00 AM - 06:00 PM',
    status: 'On Duty',
    joinDate: 'Aug 30, 2021'
  },
  {
    id: 'EMP-005',
    name: 'Karan Malhotra',
    role: 'phleb_lab',
    department: 'Hematology',
    phone: '+91 22222 22222',
    email: 'karan.m@agamdiagnostics.com',
    shift: '02:00 PM - 10:00 PM',
    status: 'Off Duty',
    joinDate: 'Jun 22, 2023'
  }
];
