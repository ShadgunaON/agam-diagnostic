export interface CollectionTask {
  id: string;
  type: 'Home Collection' | 'Lab Visit';
  time: string;
  date?: string;
  patient: string;
  address: string;
  tests: string[];
  assignedTo: string;
  bookingId?: string;
  patientId?: string;
  phlebotomistId?: string;
  status: 'Completed' | 'En Route' | 'Pending' | 'Assigned' | 'Unassigned' | 'In Progress' | 'Sample Collected' | 'Checked In';
  lat: number;
  lng: number;
}

export const mockCollections: CollectionTask[] = [
  { id: 'HC-1042', type: 'Home Collection', time: '08:30 AM', patient: 'Sarah Jenkins', address: '4231 Elm Street, Apt 4B, Springfield', tests: ['Complete Blood Count', 'HbA1c', 'Lipid Panel'], assignedTo: 'Michael R.', status: 'Completed', lat: 34.0522, lng: -118.2437, bookingId: 'B-1029' },
  { id: 'HC-1043', type: 'Home Collection', time: '10:00 AM', patient: 'Robert Chen', address: '984 Westheimer Rd, Suite 200, Springfield', tests: ['Thyroid Profile (T3, T4, TSH)'], assignedTo: 'Michael R.', status: 'En Route', lat: 34.0550, lng: -118.2500, bookingId: 'B-1035' },
  { id: 'HC-1044', type: 'Home Collection', time: '11:15 AM', patient: 'Amanda Gomez', address: '1720 Oak Drive, Springfield', tests: ['Vitamin D (25-OH)', 'Vitamin B12'], assignedTo: 'Sarah L.', status: 'Pending', lat: 34.0480, lng: -118.2400, bookingId: 'B-1037' },
  { id: 'HC-1045', type: 'Home Collection', time: '01:30 PM', patient: 'James Wilson', address: '5501 River Road, Springfield', tests: ['Liver Function Test (LFT)'], assignedTo: 'Unassigned', status: 'Unassigned', lat: 34.0600, lng: -118.2600, bookingId: 'B-1038' },
  { id: 'HC-1046', type: 'Home Collection', time: '03:45 PM', patient: 'Elena Rossi', address: '8833 Sunset Blvd, Springfield', tests: ['Comprehensive Metabolic Panel'], assignedTo: 'Unassigned', status: 'Unassigned', lat: 34.0650, lng: -118.2700 },
  // In-Lab visits
  { id: 'LV-2001', type: 'Lab Visit', time: '10:00 AM - 11:00 AM', patient: 'Priya Patel', address: 'Agam Diagnostics Lab, MG Road', tests: ['Thyroid Profile'], assignedTo: 'Lab Staff', status: 'Pending', lat: 34.0522, lng: -118.2437, bookingId: 'B-1030' },
  { id: 'LV-2002', type: 'Lab Visit', time: '09:00 AM - 10:00 AM', patient: 'Meera Reddy', address: 'Agam Diagnostics Lab, MG Road', tests: ['PCOD Profile'], assignedTo: 'Lab Staff', status: 'Sample Collected', lat: 34.0522, lng: -118.2437, bookingId: 'B-1032' },
  { id: 'LV-2003', type: 'Lab Visit', time: '08:00 AM - 09:00 AM', patient: 'Rajesh Gupta', address: 'Agam Diagnostics Lab, MG Road', tests: ['Diabetes Screening Package'], assignedTo: 'Lab Staff', status: 'Pending', lat: 34.0522, lng: -118.2437, bookingId: 'B-1036' },
  { id: 'LV-2004', type: 'Lab Visit', time: '11:00 AM - 12:00 PM', patient: 'Arjun Rao', address: 'Agam Diagnostics Lab, MG Road', tests: ['COVID RT-PCR'], assignedTo: 'Lab Staff', status: 'Pending', lat: 34.0522, lng: -118.2437, bookingId: 'B-1040' },
];

