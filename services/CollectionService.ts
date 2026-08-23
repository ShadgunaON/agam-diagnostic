import { ICollectionRepository } from '@/domains/collections/repository';
import { CollectionTaskModel } from '@/domains/collections/model';
import { BookingModel } from '@/domains/booking/model';
import { success, failure, Result } from '@/shared/result';

export class CollectionService {
  private bookingService?: import('./BookingService').BookingService;
  private reportsService?: import('./ReportsService').ReportsService;
  private notificationService?: import('./NotificationService').NotificationService;

  constructor(private readonly repository: ICollectionRepository) {}

  setBookingService(service: import('./BookingService').BookingService) {
    this.bookingService = service;
  }

  setReportsService(service: import('./ReportsService').ReportsService) {
    this.reportsService = service;
  }

  setNotificationService(service: import('./NotificationService').NotificationService) {
    this.notificationService = service;
  }

  async getAll() {
    return this.repository.getAll();
  }

  async create(task: CollectionTaskModel) {
    return this.repository.create(task);
  }

  async createFromBooking(booking: BookingModel): Promise<Result<CollectionTaskModel>> {
    const existingRes = await this.repository.getAll();
    if (existingRes.isSuccess) {
      const existing = existingRes.value.find(t => t.bookingId === booking.id);
      if (existing) return success(existing);
    }
    const task: CollectionTaskModel = {
      id: `COL-${booking.id.replace('B-', '')}`,
      type: booking.collection.type,
      patientId: booking.patientId,
      bookingId: booking.id,
      time: booking.collection.timeSlot,
      date: booking.collection.date,
      patient: booking.patient.name,
      address: booking.collection.address,
      tests: booking.items.map(i => i.name),
      assignedTo: booking.collection.assignedPhlebotomist || 'Unassigned',
      status: booking.collection.type === 'Lab Visit' ? 'Pending' : 'Unassigned',
    };
    return this.repository.create(task);
  }

  async updateTask(id: string, data: Partial<CollectionTaskModel>) {
    return this.repository.update(id, data);
  }

  /**
   * Assign a phlebotomist to a Home Collection task.
   * Sets phlebotomistId (authoritative) and assignedTo (display).
   * Updates status from Unassigned to Assigned.
   * Also updates the linked booking status.
   */
  async assignPhlebotomist(taskId: string, staffId: string, staffName: string): Promise<Result<CollectionTaskModel>> {
    const res = await this.repository.update(taskId, {
      phlebotomistId: staffId,
      assignedTo: staffName,
      status: 'Assigned',
    });

    if (res.isSuccess && res.value.bookingId && this.bookingService) {
      await this.bookingService.updateBookingStatus(res.value.bookingId, 'Assigned');
    }

    return res;
  }

  /**
   * Mark a Home Collection task as En Route.
   * Only valid for tasks with status 'Assigned' or 'Pending'.
   */
  async markEnRoute(id: string): Promise<Result<CollectionTaskModel>> {
    const res = await this.repository.update(id, { status: 'En Route' });
    return res;
  }

  async recordSampleCollected(id: string, staffId: string): Promise<Result<CollectionTaskModel>> {
    const res = await this.repository.update(id, {
      status: 'Sample Collected',
      collectedBy: staffId,
      collectedAt: new Date().toISOString()
    });
    
    if (res.isSuccess) {
      if (this.bookingService && res.value.bookingId) {
        await this.bookingService.updateBookingStatus(res.value.bookingId, 'Sample Collected');
      }
      if (this.reportsService) {
        await this.reportsService.createFromCollection(res.value);
      }
    }
    return res;
  }

  async recordCheckIn(id: string): Promise<Result<CollectionTaskModel>> {
    return this.repository.update(id, { status: 'Checked In' });
  }
}
