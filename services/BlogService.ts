import { IBlogRepository } from '@/domains/blog/repository';

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
}
