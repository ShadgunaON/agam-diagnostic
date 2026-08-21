import { ICollectionRepository } from '@/domains/collections/repository';
import { CollectionTaskModel } from '@/domains/collections/model';
import { Result } from '@/shared/result';
import { IApiClient } from '@/lib/api/client';
import { toResult } from '@/lib/api/utils';

export class ApiCollectionRepository implements ICollectionRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getAll(): Promise<Result<CollectionTaskModel[]>> {
    return toResult(this.apiClient.get<CollectionTaskModel[]>('/api/collections'));
  }

  async create(task: CollectionTaskModel): Promise<Result<CollectionTaskModel>> {
    return toResult(this.apiClient.post<CollectionTaskModel>('/api/collections', task));
  }

  async update(id: string, data: Partial<CollectionTaskModel>): Promise<Result<CollectionTaskModel>> {
    return toResult(this.apiClient.put<CollectionTaskModel>(`/api/collections/${id}`, data));
  }
}
