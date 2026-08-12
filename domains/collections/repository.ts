import { Result } from '../../shared/result';
import { CollectionTaskModel } from './model';

export interface ICollectionRepository {
  getAll(): Promise<Result<CollectionTaskModel[]>>;
  create(task: CollectionTaskModel): Promise<Result<CollectionTaskModel>>;
  update(id: string, data: Partial<CollectionTaskModel>): Promise<Result<CollectionTaskModel>>;
}
