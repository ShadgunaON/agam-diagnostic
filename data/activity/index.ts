export interface ActivityRecord {
  id: string;
  user: string;
  action: string;
  time: string;
}

export const mockActivityFeed: ActivityRecord[] = [
  { id: '1', user: 'System', action: 'New home collection (B-1030)', time: 'Just now' },
  { id: '2', user: 'Dr. Sarah', action: 'Uploaded pathology report', time: '10 mins ago' },
  { id: '3', user: 'Admin Staff', action: 'Assigned Phlebotomist', time: '1 hour ago' },
];
