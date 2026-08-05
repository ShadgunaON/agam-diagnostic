import { Result } from '../../shared/result';
import { AuthModel } from './model';

export interface IAuthRepository {
  getById(id: string): Promise<Result<AuthModel>>;
}
