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
  
  createArticle(article: Omit<BlogArticle, 'id'>): Promise<Result<BlogArticle>>;
  updateArticle(id: string, updates: Partial<BlogArticle>): Promise<Result<BlogArticle>>;
  deleteArticle(id: string): Promise<Result<void>>;
  
  subscribeToNewsletter(email: string): Promise<Result<void>>;
}
