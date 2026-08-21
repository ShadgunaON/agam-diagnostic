import { Result } from '@/shared/result';
import { NotificationModel } from './model';

export interface INotificationRepository {
  getByUserId(userId?: string): Promise<Result<NotificationModel[]>>;
  create(notification: Omit<NotificationModel, 'id' | 'createdAt'>): Promise<Result<NotificationModel>>;
  markAsRead(id: string): Promise<Result<void>>;
}

