export const mockReportTasks = [
  { id: 'REP-1001', patient: 'Ramesh Kumar', test: 'Complete Blood Count', status: 'Pending', time: '10:00 AM', priority: 'Routine' as const, requestedBy: 'Self', assignedTo: 'Unassigned', dueDate: 'Today' },
  { id: 'REP-1002', patient: 'Priya Sharma', test: 'Lipid Profile', status: 'Pending', time: '10:30 AM', priority: 'Routine' as const, requestedBy: 'Dr. Smith', assignedTo: 'Unassigned', dueDate: 'Today' },
  { id: 'REP-1003', patient: 'Suresh Menon', test: 'HbA1c', status: 'Processing', time: '11:15 AM', priority: 'Routine' as const, requestedBy: 'Self', assignedTo: 'Tech A', dueDate: 'Tomorrow' },
  { id: 'REP-1004', patient: 'Anita Desai', test: 'Thyroid Panel', status: 'Processing', time: '12:00 PM', priority: 'Routine' as const, requestedBy: 'Self', assignedTo: 'Tech B', dueDate: 'Tomorrow' },
  { id: 'REP-1005', patient: 'Vikram Singh', test: 'Vitamin D', status: 'Ready', time: '02:30 PM', priority: 'Routine' as const, requestedBy: 'Dr. Doe', assignedTo: 'Tech C', dueDate: 'Yesterday' },
  { id: 'REP-1006', patient: 'Meera Reddy', test: 'Master Health Check', status: 'Delivered', time: 'Yesterday', priority: 'Routine' as const, requestedBy: 'Self', assignedTo: 'Tech A', dueDate: 'Yesterday' },
];
export interface ReportsData {
  hero: {
    title: string;
    description: string;
  };
  emptyState: {
    title: string;
    description: string;
    icon: string;
    actionLabel: string;
    actionUrl: string;
  };
}

export const reportsData: ReportsData = {
  hero: {
    title: 'My Reports',
    description: 'View and download your diagnostic reports securely.',
  },
  emptyState: {
    title: 'No reports available yet',
    description: 'Your reports will appear here once your backend system is connected. This is an architecture placeholder.',
    icon: '📄',
    actionLabel: 'Book a Test',
    actionUrl: '/book',
  },
};
