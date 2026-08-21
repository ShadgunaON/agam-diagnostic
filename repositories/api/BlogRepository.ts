import { IBlogRepository } from '@/domains/blog/repository';
import { BlogArticle, BlogCategory, BlogHero, PopularRead } from '@/domains/blog/model';
import { Result, success, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { NotFoundError } from '@/lib/api/errors';
import { IApiClient } from '@/lib/api/client';
import { toResult } from '@/lib/api/utils';
import { blogData } from '@/data/blog';

export class ApiBlogRepository implements IBlogRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async getArticles(page = 1, limit = 10): Promise<Result<PaginatedResponse<BlogArticle>>> {
    const res = await toResult(this.apiClient.get<BlogArticle[]>('/api/blogs'));
    if (res.isFailure) {
      return failure(res.error);
    }
    const articles = res.value || [];
    return success({
      data: articles,
      meta: {
        total: articles.length,
        page,
        limit,
        totalPages: Math.ceil(articles.length / limit) || 1,
      },
    });
  }

  async getArticleBySlug(slug: string): Promise<Result<BlogArticle>> {
    return toResult(this.apiClient.get<BlogArticle>(`/api/blogs/${encodeURIComponent(slug)}`));
  }

  async getCategories(): Promise<Result<BlogCategory[]>> {
    return success(blogData.categories);
  }

  async getFeaturedArticle(): Promise<Result<BlogArticle>> {
    const res = await this.getArticles(1, 10);
    if (res.isFailure) {
      return failure(res.error);
    }
    const published = res.value.data.filter((a) => a.status === 'Published');
    if (published.length > 0) {
      return success(published[0]);
    }
    return failure(new NotFoundError('No featured article found'));
  }

  async getPopularReads(): Promise<Result<PopularRead[]>> {
    return success(blogData.popularReads);
  }

  async getHeroData(): Promise<Result<BlogHero>> {
    return success(blogData.hero);
  }

  async createArticle(article: Omit<BlogArticle, 'id'>): Promise<Result<BlogArticle>> {
    return toResult(this.apiClient.post<BlogArticle>('/api/blogs', article));
  }

  async updateArticle(id: string, updates: Partial<BlogArticle>): Promise<Result<BlogArticle>> {
    return toResult(this.apiClient.put<BlogArticle>(`/api/blogs/${encodeURIComponent(id)}`, updates));
  }

  async deleteArticle(id: string): Promise<Result<void>> {
    return toResult(this.apiClient.delete<void>(`/api/blogs/${encodeURIComponent(id)}`));
  }

  async subscribeToNewsletter(_email: string): Promise<Result<void>> {
    // Explicitly deferred per P3C.12 requirements (Newsletter separation)
    return success(undefined);
  }
}
