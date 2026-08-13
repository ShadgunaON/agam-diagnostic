export interface CollectionTaskModel {
  id: string;
  type?: 'Home Collection' | 'Lab Visit';
  patientId?: string;
  bookingId?: string;
  phlebotomistId?: string;
  time: string;
  date?: string;
  patient: string;
  address?: string;
  tests: string[];
  assignedTo?: string;
  status: 'Completed' | 'En Route' | 'Pending' | 'Assigned' | 'Unassigned' | 'In Progress' | 'Sample Collected' | 'Checked In';
  lat?: number;
  lng?: number;
  collectedAt?: string;
  collectedBy?: string;
}
