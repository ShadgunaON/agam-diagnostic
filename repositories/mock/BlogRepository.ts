import { IBlogRepository } from '@/domains/blog/repository';
import { BlogArticle, BlogCategory, BlogHero, PopularRead } from '@/domains/blog/model';
import { BlogArticleDto } from '@/domains/blog/dto';
import { mapBlogArticleDtoToModel } from '@/domains/blog/mapper';
import { Result, success, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { NotFoundError } from '@/lib/api/errors';
import { blogData } from '@/data/blog';

export class MockBlogRepository implements IBlogRepository {
  private articles: BlogArticle[];

  constructor() {
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

    this.articles = dtos.map(mapBlogArticleDtoToModel).map(a => ({
      ...a,
      status: 'Published' as const,
      views: Math.floor(Math.random() * 1000),
      author: 'Admin User',
      image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80'
    }));
  }

  async getArticles(page = 1, limit = 10): Promise<Result<PaginatedResponse<BlogArticle>>> {
    return success({
      data: [...this.articles],
      meta: { total: this.articles.length, page, limit, totalPages: Math.ceil(this.articles.length / limit) }
    });
  }

  async getArticleBySlug(slug: string): Promise<Result<BlogArticle>> {
    const article = this.articles.find(a => a.slug === slug);
    if (!article) return failure(new NotFoundError(`Article with slug ${slug} not found`));
    return success({ ...article });
  }

  async getCategories(): Promise<Result<BlogCategory[]>> {
    return success(blogData.categories);
  }

  async getFeaturedArticle(): Promise<Result<BlogArticle>> {
    const raw = blogData.featuredArticle;
    const featured = mapBlogArticleDtoToModel({
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
    });
    return success(featured);
  }

  async getPopularReads(): Promise<Result<PopularRead[]>> {
    return success(blogData.popularReads);
  }

  async getHeroData(): Promise<Result<BlogHero>> {
    return success(blogData.hero);
  }

  async createArticle(article: Omit<BlogArticle, 'id'>): Promise<Result<BlogArticle>> {
    const newArticle: BlogArticle = {
      ...article,
      id: Math.random().toString(),
    };
    this.articles.unshift(newArticle);
    return success(newArticle);
  }

  async updateArticle(id: string, updates: Partial<BlogArticle>): Promise<Result<BlogArticle>> {
    const index = this.articles.findIndex(a => a.id === id);
    if (index === -1) return failure(new NotFoundError(`Article not found`));
    
    this.articles[index] = { ...this.articles[index], ...updates };
    return success(this.articles[index]);
  }
}
