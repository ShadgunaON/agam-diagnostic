import { IActivityRepository } from '@/domains/activity/repository';

export class ActivityService {
  constructor(private readonly repository: IActivityRepository) {}

  async getAll() {
    return this.repository.getAll();
  }
}
