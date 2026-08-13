import { ICollectionRepository } from '@/domains/collections/repository';
import { CollectionTaskModel } from '@/domains/collections/model';
import { Result, success, failure } from '@/shared/result';
import { mockCollections } from '@/data/collections';
import { SharedMockAdapter } from '@/lib/storage/SharedMockAdapter';

export class MockCollectionRepository implements ICollectionRepository {
  private adapter: SharedMockAdapter<CollectionTaskModel[]>;
  private initialData: CollectionTaskModel[];

  constructor() {
    this.adapter = new SharedMockAdapter<CollectionTaskModel[]>('agam_mock_collections_state');
    // Map seed data to domain model structure if necessary, but here they are compatible
    this.initialData = mockCollections as CollectionTaskModel[];
  }

  private async getData(): Promise<CollectionTaskModel[]> {
    const loaded = await this.adapter.load();
    if (loaded && loaded.length > 0) {
      // Schema migration: backfill `type` on stale records from before the type field existed
      let needsSave = false;
      const migrated = loaded.map(task => {
        if (!task.type) {
          needsSave = true;
          return { ...task, type: 'Home Collection' as const };
        }
        return task;
      });
      if (needsSave) {
        await this.adapter.save(migrated);
      }
      return migrated;
    }
    return [...this.initialData];
  }

  private async saveData(data: CollectionTaskModel[]): Promise<void> {
    await this.adapter.save(data);
  }

  async getAll(): Promise<Result<CollectionTaskModel[]>> {
    return success(await this.getData());
  }

  async create(task: CollectionTaskModel): Promise<Result<CollectionTaskModel>> {
    const current = await this.getData();
    const updated = [task, ...current];
    await this.saveData(updated);
    return success(task);
  }

  async update(id: string, data: Partial<CollectionTaskModel>): Promise<Result<CollectionTaskModel>> {
    const current = await this.getData();
    const index = current.findIndex(t => t.id === id);
    if (index === -1) {
      return failure(new Error('Task not found'));
    }
    const updatedTask = { ...current[index], ...data };
    current[index] = updatedTask;
    await this.saveData(current);
    return success(updatedTask);
  }
}
