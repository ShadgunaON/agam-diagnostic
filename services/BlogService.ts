import { IBlogRepository } from '@/domains/blog/repository';
import { BlogArticle } from '@/domains/blog/model';

export class BlogService {
  constructor(private readonly repository: IBlogRepository) {}

  async getArticles(page = 1, limit = 10) {
    return this.repository.getArticles(page, limit);
  }

  async getArticleBySlug(slug: string) {
    return this.repository.getArticleBySlug(slug);
  }

  async getCategories() {
    return this.repository.getCategories();
  }

  async getFeaturedArticle() {
    return this.repository.getFeaturedArticle();
  }

  async getPopularReads() {
    return this.repository.getPopularReads();
  }

  async getHeroData() {
    return this.repository.getHeroData();
  }

  async createArticle(article: Omit<BlogArticle, 'id'>) {
    return this.repository.createArticle(article);
  }

  async updateArticle(id: string, updates: Partial<BlogArticle>) {
    return this.repository.updateArticle(id, updates);
  }

  async deleteArticle(id: string) {
    return this.repository.deleteArticle(id);
  }

  async subscribeToNewsletter(email: string) {
    return this.repository.subscribeToNewsletter(email);
  }

  async getNewsletterSubscribers() {
    return this.repository.getNewsletterSubscribers();
  }
}
