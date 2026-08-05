import { AuthDto } from './dto';
import { AuthModel } from './model';

export function mapAuthDtoToModel(dto: AuthDto): AuthModel {
  return { id: dto.id };
}
