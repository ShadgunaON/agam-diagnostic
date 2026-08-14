import { IBlogRepository } from '@/domains/blog/repository';
import { BlogArticle, BlogCategory, BlogHero, PopularRead } from '@/domains/blog/model';
import { BlogArticleDto } from '@/domains/blog/dto';
import { mapBlogArticleDtoToModel } from '@/domains/blog/mapper';
import { Result, success, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { NotFoundError } from '@/lib/api/errors';
import { blogData } from '@/data/blog';

// Use globalThis to persist state across Next.js dev mode hot reloads
// without breaking browser builds (since it avoids 'fs' module)
const globalForMock = globalThis as unknown as {
  __mockArticles?: BlogArticle[];
};

export class MockBlogRepository implements IBlogRepository {
  private get articles(): BlogArticle[] {
    if (globalForMock.__mockArticles) {
      return globalForMock.__mockArticles;
    }
    
    // Initialize if it doesn't exist
    const rawArticles = blogData.articles;
    const dtos: BlogArticleDto[] = rawArticles.map((raw, index) => ({
      id: `blog-${index}`,
      slug: raw.slug,
      title: raw.title,
      description: raw.description,
      content: raw.content || '', 
      published_at: raw.date,
      category: raw.category,
      author_id: 'mock-author',
      icon: raw.icon,
      color_primary: raw.colorPrimary,
      color_secondary: raw.colorSecondary,
    }));

    const initialArticles = dtos.map(mapBlogArticleDtoToModel).map(a => ({
      ...a,
      status: 'Published' as const,
      views: Math.floor(Math.random() * 1000),
      author: 'Admin User',
      image: a.imageUrl || 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
      imageUrl: a.imageUrl || 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80'
    }));
    
    globalForMock.__mockArticles = initialArticles;
    return initialArticles;
  }

  private set articles(newArticles: BlogArticle[]) {
    globalForMock.__mockArticles = newArticles;
  }

  constructor() {
    // constructor doesn't need to do anything anymore as we use getters/setters
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
      content: raw.content || '',
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
    const currentArticles = this.articles;
    currentArticles.unshift(newArticle);
    this.articles = currentArticles; // Trigger setter
    return success(newArticle);
  }

  async updateArticle(id: string, updates: Partial<BlogArticle>): Promise<Result<BlogArticle>> {
    const currentArticles = this.articles;
    const index = currentArticles.findIndex(a => a.id === id);
    if (index === -1) return failure(new NotFoundError(`Article not found`));
    
    currentArticles[index] = { ...currentArticles[index], ...updates };
    this.articles = currentArticles; // Trigger setter
    return success(currentArticles[index]);
  }

  private subscribers: string[] = [];

  async subscribeToNewsletter(email: string): Promise<Result<void>> {
    if (this.subscribers.includes(email)) {
      return failure(new Error('Email already subscribed'));
    }
    this.subscribers.push(email);
    return success(undefined);
  }
}
