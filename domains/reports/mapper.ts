import { ReportsDto } from './dto';
import { ReportsModel } from './model';

export function mapReportsDtoToModel(dto: ReportsDto): ReportsModel {
  return { 
    id: dto.id,
    hero: dto.hero,
    emptyState: dto.emptyState
  };
}
