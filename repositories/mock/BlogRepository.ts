import { IBlogRepository } from '@/domains/blog/repository';
import { BlogArticle, BlogCategory, BlogHero, PopularRead } from '@/domains/blog/model';
import { BlogArticleDto } from '@/domains/blog/dto';
import { mapBlogArticleDtoToModel } from '@/domains/blog/mapper';
import { Result, success, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { NotFoundError } from '@/lib/api/errors';
import { blogData } from '@/data/blog';

export class MockBlogRepository implements IBlogRepository {
  async getArticles(page = 1, limit = 10): Promise<Result<PaginatedResponse<BlogArticle>>> {
    const rawArticles = blogData.articles;
    
    const dtos: BlogArticleDto[] = rawArticles.map((raw, index) => ({
      id: `blog-${index}`,
      slug: raw.slug,
      title: raw.title,
      description: raw.description,
      content: '', 
      published_at: raw.date,
      category: raw.category,
      author_id: 'mock-author',
      icon: raw.icon,
      color_primary: raw.colorPrimary,
      color_secondary: raw.colorSecondary,
    }));

    const models = dtos.map(mapBlogArticleDtoToModel);

    return success({
      data: models,
      meta: { total: models.length, page, limit, totalPages: Math.ceil(models.length / limit) }
    });
  }

  async getArticleBySlug(slug: string): Promise<Result<BlogArticle>> {
    const raw = blogData.articles.find(a => a.slug === slug) || (blogData.featuredArticle.slug === slug ? blogData.featuredArticle : undefined);
    if (!raw) return failure(new NotFoundError(`Article with slug ${slug} not found`));

    return success(mapBlogArticleDtoToModel({
      id: `blog-${slug}`,
      slug: raw.slug,
      title: raw.title,
      description: raw.description,
      content: '',
      published_at: raw.date,
      category: raw.category,
      author_id: 'mock-author',
      icon: raw.icon,
      color_primary: raw.colorPrimary,
      color_secondary: raw.colorSecondary,
    }));
  }

  async getCategories(): Promise<Result<BlogCategory[]>> {
    return success(blogData.categories);
  }

  async getFeaturedArticle(): Promise<Result<BlogArticle>> {
    const raw = blogData.featuredArticle;
    return success(mapBlogArticleDtoToModel({
      id: 'featured',
      slug: raw.slug,
      title: raw.title,
      description: raw.description,
      content: '',
      published_at: raw.date,
      category: raw.category,
      author_id: 'mock-author',
      icon: raw.icon,
      color_primary: raw.colorPrimary,
      color_secondary: raw.colorSecondary,
    }));
  }

  async getPopularReads(): Promise<Result<PopularRead[]>> {
    return success(blogData.popularReads);
  }

  async getHeroData(): Promise<Result<BlogHero>> {
    return success(blogData.hero);
  }
}
