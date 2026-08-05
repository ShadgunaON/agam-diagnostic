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
