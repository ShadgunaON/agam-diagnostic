import { BlogArticleDto } from './dto';
import { BlogArticle } from './model';

export function mapBlogArticleDtoToModel(dto: BlogArticleDto): BlogArticle {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    description: dto.description,
    content: dto.content,
    date: dto.published_at, // Or parse if needed
    category: dto.category,
    authorId: dto.author_id,
    icon: dto.icon,
    colorPrimary: dto.color_primary,
    colorSecondary: dto.color_secondary,
    imageUrl: dto.cover_image_url,
  };
}
