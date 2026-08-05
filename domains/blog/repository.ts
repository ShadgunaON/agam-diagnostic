import { Result } from '../../shared/result';
import { BlogArticle, BlogCategory, BlogHero, PopularRead } from './model';
import { PaginatedResponse } from '../../lib/api/types';

export interface IBlogRepository {
  getArticles(page?: number, limit?: number): Promise<Result<PaginatedResponse<BlogArticle>>>;
  getArticleBySlug(slug: string): Promise<Result<BlogArticle>>;
  getCategories(): Promise<Result<BlogCategory[]>>;
  getFeaturedArticle(): Promise<Result<BlogArticle>>;
  getPopularReads(): Promise<Result<PopularRead[]>>;
  getHeroData(): Promise<Result<BlogHero>>;
}
