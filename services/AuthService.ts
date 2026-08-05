import { IAuthRepository } from '@/domains/auth/repository';

export class AuthService {
  constructor(private readonly repository: IAuthRepository) {}

  async getById(id: string) {
    return this.repository.getById(id);
  }
}
