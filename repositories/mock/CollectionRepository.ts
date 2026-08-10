import { ICollectionRepository } from '@/domains/collections/repository';
import { CollectionTaskModel } from '@/domains/collections/model';
import { Result, success } from '@/shared/result';
import { mockCollections } from '@/data/collections';
import { LocalStorageAdapter } from '@/lib/storage/LocalStorageAdapter';

export class MockCollectionRepository implements ICollectionRepository {
  private adapter: LocalStorageAdapter<CollectionTaskModel[]>;
  private initialData: CollectionTaskModel[];

  constructor() {
    this.adapter = new LocalStorageAdapter<CollectionTaskModel[]>('agam_mock_collections_state');
    // Map seed data to domain model structure if necessary, but here they are compatible
    this.initialData = mockCollections as CollectionTaskModel[];
  }

  private getData(): CollectionTaskModel[] {
    const loaded = this.adapter.load();
    if (loaded && loaded.length > 0) {
      return loaded;
    }
    return [...this.initialData];
  }

  private saveData(data: CollectionTaskModel[]): void {
    this.adapter.save(data);
  }

  async getAll(): Promise<Result<CollectionTaskModel[]>> {
    return success(this.getData());
  }

  async create(task: CollectionTaskModel): Promise<Result<CollectionTaskModel>> {
    const current = this.getData();
    const updated = [task, ...current];
    this.saveData(updated);
    return success(task);
  }
}
