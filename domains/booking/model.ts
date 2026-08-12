export type BookingStatus = 'Pending' | 'Confirmed' | 'Assigned' | 'Sample Collected' | 'Processing' | 'Completed' | 'Cancelled';
export type CollectionType = 'Home Collection' | 'Lab Visit';

export interface BookingModel {
  id: string;
  patientId?: string;
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
  timeline: Array<{
    id: string;
    title: string;
    description?: string;
    timestamp: string;
    status?: 'success' | 'info' | 'neutral' | 'danger' | 'warning';
    actor?: string;
  }>;
  createdAt: string;
  trustFeatures?: Array<{
    title: string;
  }>;
}
