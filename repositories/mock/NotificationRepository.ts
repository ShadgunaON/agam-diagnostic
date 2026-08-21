import { INotificationRepository } from '@/domains/notification/repository';
import { NotificationModel } from '@/domains/notification/model';
import { Result, success } from '@/shared/result';
import { SharedMockAdapter } from '@/lib/storage/SharedMockAdapter';

export class MockNotificationRepository implements INotificationRepository {
  private adapter: SharedMockAdapter<NotificationModel[]>;

  constructor() {
    this.adapter = new SharedMockAdapter<NotificationModel[]>('mock_notifications');
  }

  async getByUserId(userId?: string): Promise<Result<NotificationModel[]>> {
    const data = await this.adapter.load() || [];
    const userNotifs = (userId ? data.filter(n => n.userId === userId) : data)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return success(userNotifs);
  }


  async create(notif: Omit<NotificationModel, 'id' | 'createdAt'>): Promise<Result<NotificationModel>> {
    const data = await this.adapter.load() || [];
    const newNotif: NotificationModel = {
      ...notif,
      id: `NOTIF-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    data.push(newNotif);
    await this.adapter.save(data);
    return success(newNotif);
  }

  async markAsRead(id: string): Promise<Result<void>> {
    const data = await this.adapter.load() || [];
    const index = data.findIndex(n => n.id === id);
    if (index >= 0) {
      data[index].isRead = true;
      await this.adapter.save(data);
    }
    return success(undefined);
  }
}
