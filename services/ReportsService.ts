import { IReportsRepository } from '@/domains/reports/repository';
import { ReportTaskModel } from '@/domains/reports/model';
import { CollectionTaskModel } from '@/domains/collections/model';
import { success, failure, Result } from '@/shared/result';

export class ReportsService {
  private bookingService?: import('./BookingService').BookingService;

  constructor(private readonly repository: IReportsRepository) {}

  setBookingService(service: import('./BookingService').BookingService) {
    this.bookingService = service;
  }

  async getById(id: string) {
    return this.repository.getById(id);
  }

  async getAllTasks() {
    return this.repository.getAllTasks();
  }

  async createFromCollection(collection: CollectionTaskModel): Promise<Result<ReportTaskModel>> {
    const existingRes = await this.repository.getAllTasks();
    if (existingRes.isSuccess) {
      const existing = existingRes.value.find(t => t.bookingId === collection.bookingId);
      if (existing) return success(existing);
    }
    
    const reportTask: ReportTaskModel = {
      id: `REP-${collection.bookingId?.replace('B-', '') || Date.now()}`,
      patientId: collection.patientId,
      bookingId: collection.bookingId,
      patient: { name: collection.patient, age: 30, gender: 'Male', id: collection.patientId || 'pat_1' },
      testType: collection.tests.join(', '),
      status: 'Processing',
      priority: 'Routine',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      results: []
    };
    return this.repository.createTask(reportTask);
  }

  async updateStatus(id: string, status: ReportTaskModel['status']) {
    return this.repository.updateStatus(id, status);
  }
}
