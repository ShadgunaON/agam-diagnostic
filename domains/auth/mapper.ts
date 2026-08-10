import { AuthDto } from './dto';
import { UserProfile } from './model';

export function mapAuthDtoToModel(dto: AuthDto): UserProfile {
  void dto;
  return {} as UserProfile;
}
