export interface ReportsDto {
  id: string;
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
