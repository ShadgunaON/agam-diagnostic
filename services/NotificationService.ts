import { INotificationRepository } from '@/domains/notification/repository';
import { CollectionTaskModel } from '@/domains/collections/model';

export class NotificationService {
  constructor(private readonly repository: INotificationRepository) {}

  async getMyNotifications(userId: string) {
    return this.repository.getByUserId(userId);
  }

  async markAsRead(id: string) {
    return this.repository.markAsRead(id);
  }

  async createAssignmentNotification(staffId: string, task: CollectionTaskModel) {
    return this.repository.create({
      userId: staffId,
      title: 'New Home Collection Assignment',
      message: `You have been assigned a Home Collection for ${task.patient} at ${task.time} on ${task.date}.`,
      isRead: false,
      link: `/admin/collections`
    });
  }
}
