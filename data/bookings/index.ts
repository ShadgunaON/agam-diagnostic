import { TimelineEvent } from '../../components/admin/feedback/Timeline';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Assigned' | 'Sample Collected' | 'Processing' | 'Completed' | 'Cancelled';
export type CollectionType = 'Home Collection' | 'Lab Visit';

export interface Booking {
  id: string;
  patient: {
    name: string;
    phone: string;
    email: string;
    age: number;
    gender: string;
  };
  collection: {
    type: CollectionType;
    date: string;
    timeSlot: string;
    address?: string;
    assignedPhlebotomist?: string;
  };
  items: Array<{
    name: string;
    type: 'Package' | 'Test';
    price: number;
  }>;
  payment: {
    total: number;
    status: 'Paid' | 'Pending' | 'Failed';
    method: string;
  };
  status: BookingStatus;
  timeline: TimelineEvent[];
  createdAt: string;
}

export const mockBookings: Booking[] = [
  {
    id: 'B-1029',
    patient: {
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul.s@example.com',
      age: 45,
      gender: 'Male'
    },
    collection: {
      type: 'Home Collection',
      date: 'Oct 12, 2026',
      timeSlot: '08:00 AM - 09:00 AM',
      address: 'Apt 4B, Sunrise Towers, HSR Layout, Bangalore',
      assignedPhlebotomist: 'Suresh Kumar'
    },
    items: [
      { name: 'Comprehensive Full Body Checkup', type: 'Package', price: 2499 },
      { name: 'Vitamin D3 Test', type: 'Test', price: 600 }
    ],
    payment: {
      total: 3099,
      status: 'Paid',
      method: 'UPI'
    },
    status: 'Completed',
    createdAt: 'Oct 10, 2026',
    timeline: [
      { id: 't1', title: 'Booking Created', timestamp: 'Oct 10, 2026 10:30 AM', status: 'success', actor: 'Patient' },
      { id: 't2', title: 'Payment Received', timestamp: 'Oct 10, 2026 10:32 AM', status: 'success', actor: 'System' },
      { id: 't3', title: 'Booking Confirmed', timestamp: 'Oct 10, 2026 10:35 AM', status: 'success', actor: 'System' },
      { id: 't4', title: 'Phlebotomist Assigned', description: 'Assigned to Suresh Kumar', timestamp: 'Oct 11, 2026 09:00 AM', status: 'info', actor: 'Admin' },
      { id: 't5', title: 'Sample Collected', description: 'Collected at HSR Layout', timestamp: 'Oct 12, 2026 08:45 AM', status: 'info', actor: 'Suresh Kumar' }
    ]
  },
  {
    id: 'B-1030',
    patient: {
      name: 'Priya Patel',
      phone: '+91 91234 56789',
      email: 'priya.p@example.com',
      age: 32,
      gender: 'Female'
    },
    collection: {
      type: 'Lab Visit',
      date: 'Oct 13, 2026',
      timeSlot: '10:00 AM - 11:00 AM'
    },
    items: [
      { name: 'Thyroid Profile', type: 'Test', price: 499 }
    ],
    payment: {
      total: 499,
      status: 'Pending',
      method: 'Pay at Lab'
    },
    status: 'Confirmed',
    createdAt: 'Oct 11, 2026',
    timeline: [
      { id: 'p1', title: 'Booking Created', timestamp: 'Oct 11, 2026 02:15 PM', status: 'success', actor: 'Patient' },
      { id: 'p2', title: 'Booking Confirmed', timestamp: 'Oct 11, 2026 02:16 PM', status: 'success', actor: 'System' }
    ]
  },
  {
    id: 'B-1031',
    patient: {
      name: 'Anil Kumar',
      phone: '+91 99887 76655',
      email: 'anil.k@example.com',
      age: 58,
      gender: 'Male'
    },
    collection: {
      type: 'Home Collection',
      date: 'Oct 14, 2026',
      timeSlot: '07:00 AM - 08:00 AM',
      address: 'Villa 12, Palm Meadows, Whitefield, Bangalore'
    },
    items: [
      { name: 'Senior Citizen Health Package (Male)', type: 'Package', price: 3499 }
    ],
    payment: {
      total: 3499,
      status: 'Paid',
      method: 'Credit Card'
    },
    status: 'Pending',
    createdAt: 'Oct 12, 2026',
    timeline: [
      { id: 'a1', title: 'Booking Created', timestamp: 'Oct 12, 2026 09:10 AM', status: 'success', actor: 'Patient' },
      { id: 'a2', title: 'Payment Received', timestamp: 'Oct 12, 2026 09:12 AM', status: 'success', actor: 'System' }
    ]
  },
  {
    id: 'B-1032',
    patient: {
      name: 'Meera Reddy',
      phone: '+91 98765 12345',
      email: 'meera.r@example.com',
      age: 28,
      gender: 'Female'
    },
    collection: {
      type: 'Lab Visit',
      date: 'Oct 10, 2026',
      timeSlot: '09:00 AM - 10:00 AM'
    },
    items: [
      { name: 'PCOD Profile', type: 'Package', price: 1899 }
    ],
    payment: {
      total: 1899,
      status: 'Paid',
      method: 'UPI'
    },
    status: 'Processing',
    createdAt: 'Oct 09, 2026',
    timeline: [
      { id: 'm1', title: 'Booking Created', timestamp: 'Oct 09, 2026 11:20 AM', status: 'success', actor: 'Patient' },
      { id: 'm2', title: 'Booking Confirmed', timestamp: 'Oct 09, 2026 11:25 AM', status: 'success', actor: 'System' },
      { id: 'm3', title: 'Sample Collected (Lab)', timestamp: 'Oct 10, 2026 09:15 AM', status: 'success', actor: 'Lab Tech' },
      { id: 'm4', title: 'Sent to Processing', timestamp: 'Oct 10, 2026 10:00 AM', status: 'info', actor: 'System' }
    ]
  },
  {
    id: 'B-1033',
    patient: {
      name: 'Suresh Menon',
      phone: '+91 94444 33333',
      email: 'suresh.m@example.com',
      age: 62,
      gender: 'Male'
    },
    collection: {
      type: 'Home Collection',
      date: 'Oct 12, 2026',
      timeSlot: '08:00 AM - 09:00 AM',
      address: 'Flat 101, Residency Apts, Indiranagar, Bangalore'
    },
    items: [
      { name: 'Cardiac Risk Markers', type: 'Test', price: 1200 }
    ],
    payment: {
      total: 1200,
      status: 'Failed',
      method: 'Net Banking'
    },
    status: 'Cancelled',
    createdAt: 'Oct 11, 2026',
    timeline: [
      { id: 's1', title: 'Booking Created', timestamp: 'Oct 11, 2026 10:00 AM', status: 'neutral', actor: 'Patient' },
      { id: 's2', title: 'Payment Failed', description: 'Bank server timeout', timestamp: 'Oct 11, 2026 10:05 AM', status: 'danger', actor: 'System' },
      { id: 's3', title: 'Booking Cancelled', timestamp: 'Oct 11, 2026 10:30 AM', status: 'danger', actor: 'Patient' }
    ]
  },
  {
    id: 'B-1034',
    patient: {
      name: 'Kavita Singh',
      phone: '+91 90000 11111',
      email: 'kavita.s@example.com',
      age: 35,
      gender: 'Female'
    },
    collection: {
      type: 'Lab Visit',
      date: 'Oct 08, 2026',
      timeSlot: '11:00 AM - 12:00 PM'
    },
    items: [
      { name: 'HbA1c', type: 'Test', price: 400 },
      { name: 'Fasting Blood Sugar', type: 'Test', price: 150 }
    ],
    payment: {
      total: 550,
      status: 'Paid',
      method: 'Cash'
    },
    status: 'Completed',
    createdAt: 'Oct 07, 2026',
    timeline: [
      { id: 'k1', title: 'Booking Created', timestamp: 'Oct 07, 2026 04:00 PM', status: 'success', actor: 'Patient' },
      { id: 'k2', title: 'Sample Collected', timestamp: 'Oct 08, 2026 11:15 AM', status: 'success', actor: 'Lab Tech' },
      { id: 'k3', title: 'Reports Generated', timestamp: 'Oct 08, 2026 05:30 PM', status: 'success', actor: 'System' },
      { id: 'k4', title: 'Booking Completed', timestamp: 'Oct 08, 2026 05:35 PM', status: 'success', actor: 'System' }
    ]
  },
  {
    id: 'B-1035',
    patient: { name: 'Deepa Nair', phone: '+91 97777 88888', email: 'deepa.n@example.com', age: 41, gender: 'Female' },
    collection: { type: 'Home Collection', date: 'Oct 15, 2026', timeSlot: '09:00 AM - 10:00 AM', address: '22, MG Road, Koramangala, Bangalore', assignedPhlebotomist: 'Ravi Prasad' },
    items: [{ name: 'Complete Blood Count', type: 'Test', price: 350 }, { name: 'Lipid Profile', type: 'Test', price: 500 }],
    payment: { total: 850, status: 'Paid', method: 'UPI' },
    status: 'Assigned',
    createdAt: 'Oct 13, 2026',
    timeline: [
      { id: 'd1', title: 'Booking Created', timestamp: 'Oct 13, 2026 03:00 PM', status: 'success', actor: 'Patient' },
      { id: 'd2', title: 'Payment Received', timestamp: 'Oct 13, 2026 03:02 PM', status: 'success', actor: 'System' },
      { id: 'd3', title: 'Phlebotomist Assigned', description: 'Assigned to Ravi Prasad', timestamp: 'Oct 14, 2026 08:00 AM', status: 'info', actor: 'Admin' }
    ]
  },
  {
    id: 'B-1036',
    patient: { name: 'Rajesh Gupta', phone: '+91 88888 99999', email: 'rajesh.g@example.com', age: 52, gender: 'Male' },
    collection: { type: 'Lab Visit', date: 'Oct 16, 2026', timeSlot: '08:00 AM - 09:00 AM' },
    items: [{ name: 'Diabetes Screening Package', type: 'Package', price: 1299 }],
    payment: { total: 1299, status: 'Pending', method: 'Pay at Lab' },
    status: 'Confirmed',
    createdAt: 'Oct 14, 2026',
    timeline: [
      { id: 'r1', title: 'Booking Created', timestamp: 'Oct 14, 2026 11:00 AM', status: 'success', actor: 'Patient' },
      { id: 'r2', title: 'Booking Confirmed', timestamp: 'Oct 14, 2026 11:05 AM', status: 'success', actor: 'System' }
    ]
  },
  {
    id: 'B-1037',
    patient: { name: 'Lakshmi Iyer', phone: '+91 95555 66666', email: 'lakshmi.i@example.com', age: 38, gender: 'Female' },
    collection: { type: 'Home Collection', date: 'Oct 13, 2026', timeSlot: '07:00 AM - 08:00 AM', address: 'Flat 5A, Green Valley Apts, JP Nagar, Bangalore' },
    items: [{ name: 'Thyroid Profile', type: 'Test', price: 499 }, { name: 'Vitamin B12', type: 'Test', price: 750 }],
    payment: { total: 1249, status: 'Paid', method: 'Credit Card' },
    status: 'Completed',
    createdAt: 'Oct 11, 2026',
    timeline: [
      { id: 'l1', title: 'Booking Created', timestamp: 'Oct 11, 2026 06:00 PM', status: 'success', actor: 'Patient' },
      { id: 'l2', title: 'Sample Collected', timestamp: 'Oct 13, 2026 07:30 AM', status: 'success', actor: 'Suresh Kumar' },
      { id: 'l3', title: 'Reports Generated', timestamp: 'Oct 13, 2026 04:00 PM', status: 'success', actor: 'System' },
      { id: 'l4', title: 'Booking Completed', timestamp: 'Oct 13, 2026 04:05 PM', status: 'success', actor: 'System' }
    ]
  },
  {
    id: 'B-1038',
    patient: { name: 'Vikram Joshi', phone: '+91 91111 22222', email: 'vikram.j@example.com', age: 47, gender: 'Male' },
    collection: { type: 'Home Collection', date: 'Oct 17, 2026', timeSlot: '06:30 AM - 07:30 AM', address: 'House 8, Brigade Road, Bangalore' },
    items: [{ name: 'Liver Function Test', type: 'Test', price: 800 }],
    payment: { total: 800, status: 'Paid', method: 'Net Banking' },
    status: 'Pending',
    createdAt: 'Oct 15, 2026',
    timeline: [
      { id: 'v1', title: 'Booking Created', timestamp: 'Oct 15, 2026 09:30 AM', status: 'success', actor: 'Patient' },
      { id: 'v2', title: 'Payment Received', timestamp: 'Oct 15, 2026 09:32 AM', status: 'success', actor: 'System' }
    ]
  },
  {
    id: 'B-1039',
    patient: { name: 'Sunita Devi', phone: '+91 93333 44444', email: 'sunita.d@example.com', age: 55, gender: 'Female' },
    collection: { type: 'Lab Visit', date: 'Oct 09, 2026', timeSlot: '10:00 AM - 11:00 AM' },
    items: [{ name: 'Women Wellness Package', type: 'Package', price: 2999 }],
    payment: { total: 2999, status: 'Paid', method: 'UPI' },
    status: 'Processing',
    createdAt: 'Oct 08, 2026',
    timeline: [
      { id: 'su1', title: 'Booking Created', timestamp: 'Oct 08, 2026 08:00 AM', status: 'success', actor: 'Receptionist' },
      { id: 'su2', title: 'Sample Collected (Lab)', timestamp: 'Oct 09, 2026 10:20 AM', status: 'success', actor: 'Lab Tech' },
      { id: 'su3', title: 'Sent to Processing', timestamp: 'Oct 09, 2026 11:00 AM', status: 'info', actor: 'System' }
    ]
  },
  {
    id: 'B-1040',
    patient: { name: 'Arjun Rao', phone: '+91 92222 33333', email: 'arjun.r@example.com', age: 29, gender: 'Male' },
    collection: { type: 'Lab Visit', date: 'Oct 18, 2026', timeSlot: '11:00 AM - 12:00 PM' },
    items: [{ name: 'COVID RT-PCR', type: 'Test', price: 500 }],
    payment: { total: 500, status: 'Pending', method: 'Pay at Lab' },
    status: 'Pending',
    createdAt: 'Oct 16, 2026',
    timeline: [
      { id: 'ar1', title: 'Booking Created', timestamp: 'Oct 16, 2026 02:00 PM', status: 'success', actor: 'Patient' }
    ]
  }
];
export interface BookingData {
  trustFeatures: Array<{
    title: string;
  }>;
}

export const bookingData: BookingData = {
  trustFeatures: [
    { title: 'NABL Accredited' },
    { title: 'ICMR Approved' },
    { title: 'Secure Booking' },
    { title: 'Trusted by 50,000+ Patients' },
  ],
};
