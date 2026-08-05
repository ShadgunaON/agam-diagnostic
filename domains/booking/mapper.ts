import { BookingDto } from './dto';
import { BookingModel } from './model';

export function mapBookingDtoToModel(dto: BookingDto): BookingModel {
  return { 
    id: dto.id,
    trustFeatures: dto.trustFeatures 
  };
}
