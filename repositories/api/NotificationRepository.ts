import { INotificationRepository } from '@/domains/notification/repository';
import { NotificationModel } from '@/domains/notification/model';
import { Result } from '@/shared/result';
import { IApiClient } from '@/lib/api/client';
import { toResult } from '@/lib/api/utils';

export class ApiNotificationRepository implements INotificationRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getByUserId(userId?: string): Promise<Result<NotificationModel[]>> {
    const endpoint = userId ? `/api/notifications?userId=${encodeURIComponent(userId)}` : '/api/notifications';
    return toResult(this.apiClient.get<NotificationModel[]>(endpoint));
  }


  async create(notification: Omit<NotificationModel, 'id' | 'createdAt'>): Promise<Result<NotificationModel>> {
    return toResult(this.apiClient.post<NotificationModel>('/api/notifications', notification));
  }

  async markAsRead(id: string): Promise<Result<void>> {
    return toResult(this.apiClient.put<void>(`/api/notifications/${id}/read`, {}));
  }
}
