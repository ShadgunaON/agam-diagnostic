export interface CollectionTask {
  id: string;
  time: string;
  patient: string;
  address: string;
  tests: string[];
  assignedTo: string;
  status: 'Completed' | 'En Route' | 'Pending' | 'Unassigned' | 'In Progress';
  lat: number;
  lng: number;
}

export const mockCollections: CollectionTask[] = [
  { id: 'HC-1042', time: '08:30 AM', patient: 'Sarah Jenkins', address: '4231 Elm Street, Apt 4B, Springfield', tests: ['Complete Blood Count', 'HbA1c', 'Lipid Panel'], assignedTo: 'Michael R.', status: 'Completed', lat: 34.0522, lng: -118.2437 },
  { id: 'HC-1043', time: '10:00 AM', patient: 'Robert Chen', address: '984 Westheimer Rd, Suite 200, Springfield', tests: ['Thyroid Profile (T3, T4, TSH)'], assignedTo: 'Michael R.', status: 'En Route', lat: 34.0550, lng: -118.2500 },
  { id: 'HC-1044', time: '11:15 AM', patient: 'Amanda Gomez', address: '1720 Oak Drive, Springfield', tests: ['Vitamin D (25-OH)', 'Vitamin B12'], assignedTo: 'Sarah L.', status: 'Pending', lat: 34.0480, lng: -118.2400 },
  { id: 'HC-1045', time: '01:30 PM', patient: 'James Wilson', address: '5501 River Road, Springfield', tests: ['Liver Function Test (LFT)'], assignedTo: 'Unassigned', status: 'Unassigned', lat: 34.0600, lng: -118.2600 },
  { id: 'HC-1046', time: '03:45 PM', patient: 'Elena Rossi', address: '8833 Sunset Blvd, Springfield', tests: ['Comprehensive Metabolic Panel'], assignedTo: 'Unassigned', status: 'Unassigned', lat: 34.0650, lng: -118.2700 },
];
