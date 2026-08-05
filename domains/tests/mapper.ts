import { TestItemDto } from './dto';
import { TestItem } from './model';

export function mapTestItemDtoToModel(dto: TestItemDto): TestItem {
  return {
    id: dto.id,
    slug: dto.url_slug,
    title: dto.name,
    category: dto.category_id,
    tag: dto.tag_name,
    description: dto.summary,
  };
}
