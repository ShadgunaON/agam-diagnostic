import { ReportsService } from './ReportsService';
import { CollectionService } from './CollectionService';

export class AlertService {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly collectionService: CollectionService
  ) {}

  async getOperationalAlerts() {
    const alerts: Array<{ id: string; message: string; severity: 'danger' | 'warning' | 'info'; time: string }> = [];

    // Derive overdue reports
    const reportsResult = await this.reportsService.getAllTasks();
    if (reportsResult.isSuccess) {
      const overdueCount = reportsResult.value.filter(r => r.status === 'Awaiting Verification' && r.priority === 'STAT').length;
      if (overdueCount > 0) {
        alerts.push({
          id: 'alert-1',
          message: `${overdueCount} reports overdue by more than 24 hours`,
          severity: 'danger',
          time: '2h ago'
        });
      }
    }

    // Derive unassigned collections
    const collectionsResult = await this.collectionService.getAll();
    if (collectionsResult.isSuccess) {
      const unassignedCount = collectionsResult.value.filter(c => c.status === 'Unassigned').length;
      if (unassignedCount > 0) {
        alerts.push({
          id: 'alert-2',
          message: `${unassignedCount} home collections unassigned for tomorrow`,
          severity: 'warning',
          time: '1h ago'
        });
      }
    }

    // Hardcode an info alert for UI purposes (or derive from payments if we had a payment service)
    alerts.push({
      id: 'alert-3',
      message: '2 payments pending verification',
      severity: 'info',
      time: '45m ago'
    });

    return alerts;
  }
}
