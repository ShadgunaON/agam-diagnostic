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
    name: 'Dr. Aravind Swamy',
    role: 'Chief Pathologist',
    department: 'Pathology',
    phone: '+91 98765 11223',
    email: 'aravind.s@agam.com',
    shift: '09:00 AM - 05:00 PM',
    status: 'On Duty',
    joinDate: 'Jan 15, 2021'
  },
  {
    id: 'EMP-002',
    name: 'Sunita Rao',
    role: 'Senior Phlebotomist',
    department: 'Sample Collection',
    phone: '+91 99887 22334',
    email: 'sunita.r@agam.com',
    shift: '07:00 AM - 03:00 PM',
    status: 'On Duty',
    joinDate: 'Mar 10, 2022'
  },
  {
    id: 'EMP-003',
    name: 'Karan Malhotra',
    role: 'Lab Technician',
    department: 'Hematology',
    phone: '+91 91122 33445',
    email: 'karan.m@agam.com',
    shift: '02:00 PM - 10:00 PM',
    status: 'Off Duty',
    joinDate: 'Jun 22, 2023'
  },
  {
    id: 'EMP-004',
    name: 'Neha Gupta',
    role: 'Receptionist',
    department: 'Front Desk',
    phone: '+91 92233 44556',
    email: 'neha.g@agam.com',
    shift: '08:00 AM - 04:00 PM',
    status: 'On Duty',
    joinDate: 'Nov 05, 2023'
  },
  {
    id: 'EMP-005',
    name: 'Ramesh Singh',
    role: 'Field Phlebotomist',
    department: 'Home Collection',
    phone: '+91 93344 55667',
    email: 'ramesh.s@agam.com',
    shift: '06:00 AM - 02:00 PM',
    status: 'On Leave',
    joinDate: 'Feb 18, 2022'
  },
  {
    id: 'EMP-006',
    name: 'Dr. Meenakshi Iyer',
    role: 'Microbiologist',
    department: 'Microbiology',
    phone: '+91 94455 66778',
    email: 'meenakshi.i@agam.com',
    shift: '10:00 AM - 06:00 PM',
    status: 'On Duty',
    joinDate: 'Aug 30, 2021'
  },
  {
    id: 'EMP-007',
    name: 'Vikash Kumar',
    role: 'Lab Technician',
    department: 'Biochemistry',
    phone: '+91 95566 77889',
    email: 'vikash.k@agam.com',
    shift: '08:00 AM - 04:00 PM',
    status: 'On Duty',
    joinDate: 'May 12, 2023'
  },
  {
    id: 'EMP-008',
    name: 'Priya Desai',
    role: 'Customer Support',
    department: 'Support',
    phone: '+91 96677 88990',
    email: 'priya.d@agam.com',
    shift: '12:00 PM - 08:00 PM',
    status: 'Off Duty',
    joinDate: 'Sep 01, 2023'
  }
];
