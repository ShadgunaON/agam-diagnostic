import { IBlogRepository } from '@/domains/blog/repository';
import { BlogArticle, BlogCategory, BlogHero, PopularRead } from '@/domains/blog/model';
import { Result, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { ServerError } from '@/lib/api/errors';
import { IApiClient } from '@/lib/api/client';

export class ApiBlogRepository implements IBlogRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getArticles(_page?: number, _limit?: number): Promise<Result<PaginatedResponse<BlogArticle>>> {
    void _page;
    void _limit;
    return failure(new ServerError('Not implemented'));
  }

  async getArticleBySlug(_slug: string): Promise<Result<BlogArticle>> {
    void _slug;
    return failure(new ServerError('Not implemented'));
  }

  async getCategories(): Promise<Result<BlogCategory[]>> {
    return failure(new ServerError('Not implemented'));
  }

  async getFeaturedArticle(): Promise<Result<BlogArticle>> {
    return failure(new ServerError('Not implemented'));
  }

  async getPopularReads(): Promise<Result<PopularRead[]>> {
    return failure(new ServerError('Not implemented'));
  }

  async getHeroData(): Promise<Result<BlogHero>> {
    // Stub implementation
    return failure(new Error('Method not implemented.'));
  }

  async createArticle(article: Omit<BlogArticle, 'id'>): Promise<Result<BlogArticle>> {
    // Stub implementation
    return failure(new Error('Method not implemented.'));
  }

  async updateArticle(id: string, updates: Partial<BlogArticle>): Promise<Result<BlogArticle>> {
    // Stub implementation
    return failure(new Error('Method not implemented.'));
  }
}
