import { IBlogRepository } from '@/domains/blog/repository';
import { BlogArticle, BlogCategory, BlogHero, PopularRead } from '@/domains/blog/model';
import { BlogArticleDto } from '@/domains/blog/dto';
import { mapBlogArticleDtoToModel } from '@/domains/blog/mapper';
import { Result, success, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { NotFoundError } from '@/lib/api/errors';
import { blogData } from '@/data/blog';

import { LocalStorageAdapter } from '@/lib/storage/LocalStorageAdapter';

export class MockBlogRepository implements IBlogRepository {
  private readonly storageAdapter = new LocalStorageAdapter<BlogArticle[]>('mock_blog_articles');

  private get initialArticles(): BlogArticle[] {
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

    return dtos.map(mapBlogArticleDtoToModel).map(a => ({
      ...a,
      status: 'Published' as const,
      views: Math.floor(Math.random() * 1000),
      author: 'Admin User',
      image: a.imageUrl || '/images/blog_lab.png',
      imageUrl: a.imageUrl || '/images/blog_lab.png'
    }));
  }

  private get articles(): BlogArticle[] {
    if (typeof window !== 'undefined') {
      const stored = this.storageAdapter.load();
      if (stored) return stored;
      
      const initial = this.initialArticles;
      this.storageAdapter.save(initial);
      return initial;
    }
    
    // Server-side: return seed data without mutating global state
    return this.initialArticles;
  }

  private set articles(newArticles: BlogArticle[]) {
    if (typeof window !== 'undefined') {
      this.storageAdapter.save(newArticles);
    }
  }

  constructor() {}

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
    const publishedArticles = this.articles.filter(a => a.status === 'Published');
    if (publishedArticles.length > 0) {
      return success(publishedArticles[0]);
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

  async deleteArticle(id: string): Promise<Result<void>> {
    const currentArticles = this.articles;
    const index = currentArticles.findIndex(a => a.id === id);
    if (index === -1) return failure(new NotFoundError(`Article not found`));
    
    currentArticles.splice(index, 1);
    this.articles = currentArticles; // Trigger setter
    return success(undefined);
  }

  private subscribers: any[] = [];

  async subscribeToNewsletter(email: string): Promise<Result<{ message: string; subscriber: any }>> {
    const existing = this.subscribers.find(s => s.email === email);
    if (!existing) {
      const sub = { id: Date.now().toString(), email, status: 'Active', subscribedAt: new Date().toISOString() };
      this.subscribers.push(sub);
      
      try {
        // Dispatch notification to mock admin to mirror backend behavior
        const { notificationService } = await import('@/services');
        const { PRESEEDED_EXISTING_USER, ADMIN_USER } = await import('@/repositories/mock/AuthRepository');
        
        await notificationService.create({
          userId: ADMIN_USER.staffId || ADMIN_USER.id,
          title: 'New Newsletter Subscriber',
          message: `${email} has subscribed to the newsletter.`,
          type: 'success',
          link: '/admin/newsletter',
          ownerSub: PRESEEDED_EXISTING_USER.id, // Just a placeholder owner
          createdBy: 'system'
        });
      } catch (err) {
        console.warn('Failed to dispatch mock newsletter notification', err);
      }
      
      return success({ message: 'Subscribed successfully', subscriber: sub });
    }
    return success({ message: 'Subscribed successfully', subscriber: existing });
  }

  async getNewsletterSubscribers(): Promise<Result<any[]>> {
    return success(this.subscribers);
  }
}
