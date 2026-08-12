export interface CollectionTaskModel {
  id: string;
  patientId?: string;
  bookingId?: string;
  phlebotomistId?: string;
  time: string;
  patient: string;
  address: string;
  tests: string[];
  assignedTo: string;
  status: 'Completed' | 'En Route' | 'Pending' | 'Unassigned' | 'In Progress';
  lat: number;
  lng: number;
}
