import { ICollectionRepository } from '@/domains/collections/repository';

export class CollectionService {
  constructor(private readonly repository: ICollectionRepository) {}

  async getAll() {
    return this.repository.getAll();
  }

  async create(task: import('@/domains/collections/model').CollectionTaskModel) {
    return this.repository.create(task);
  }
}
