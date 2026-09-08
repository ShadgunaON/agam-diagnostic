import { BlogArticle, BlogCategory, BlogHero, PopularRead, NewsletterSubscriber } from '@/domains/blog/model';
import { Result, success, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { NotFoundError } from '@/lib/api/errors';
import { blogData } from '@/data/blog';

export class BlogService {
  constructor() {}

  private async _graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      const isServer = typeof window === 'undefined';
      const token = !isServer
        ? (sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '')
        : '';

      if (isServer) {
        // Direct AppSync fetch for SSR — avoids hairpin routing timeout on Amplify
        const apiUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://cihtpsxiibcb5bewwzxibt2l3i.appsync-api.us-east-1.amazonaws.com/graphql';
        const apiKey = process.env.APPSYNC_API_KEY || '';
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: token } : apiKey ? { 'x-api-key': apiKey } : {}),
          },
          body: JSON.stringify({ query, variables }),
        });
        if (!response.ok) return null;
        const { data, errors } = await response.json();
        if (errors?.length) throw new Error(errors[0].message);
        return data as T;
      }

      const _url = '/api/graphql';
      const response = await fetch(_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
      });
      if (!response.ok) return null;
      const { data, errors } = await response.json();
      if (errors?.length) { console.error('GraphQL errors:', errors); return null; }
      return data as T;
    } catch (err) {
      console.error('GraphQL fetch failed:', err);
      return null;
    }
  }

  async getArticles(page = 1, limit = 10): Promise<Result<PaginatedResponse<BlogArticle>>> {
    const data = await this._graphqlFetch<{ blogs: BlogArticle[] }>(
      `query Blogs {
        blogs {
          id slug title description content date category author authorId
          icon colorPrimary colorSecondary imageUrl image status views publishedAt createdAt
        }
      }`
    );
    if (!data?.blogs) return failure(new Error('Failed to load articles'));

    const articles = data.blogs || [];
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
    const data = await this._graphqlFetch<{ blogById: BlogArticle }>(
      `query BlogById($idOrSlug: String!) {
        blogById(idOrSlug: $idOrSlug) {
          id slug title description content date category author authorId
          icon colorPrimary colorSecondary imageUrl image status views publishedAt createdAt
        }
      }`,
      { idOrSlug: slug }
    );
    if (data?.blogById) return success(data.blogById);
    return failure(new Error('Article not found'));
  }

  async getCategories(): Promise<Result<BlogCategory[]>> {
    return success(blogData.categories);
  }

  async getFeaturedArticle(): Promise<Result<BlogArticle>> {
    const res = await this.getArticles(1, 10);
    if (res.isFailure) return failure(res.error);
    const published = res.value.data.filter((a) => a.status === 'Published');
    if (published.length > 0) return success(published[0]);
    return failure(new NotFoundError('No featured article found'));
  }

  async getPopularReads(): Promise<Result<PopularRead[]>> {
    const res = await this.getArticles(1, 50);
    if (res.isFailure) return failure(res.error);
    
    const published = res.value.data.filter((a) => a.status === 'Published');
    const popular = published
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(article => ({
        title: article.title,
        imageUrl: article.imageUrl || article.image || '/assets/images/placeholder.jpg',
        date: article.date,
        icon: article.icon || 'DocumentTextIcon',
        slug: article.slug
      }));
      
    return success(popular);
  }

  async getHeroData(): Promise<Result<BlogHero>> {
    return success(blogData.hero);
  }

  async createArticle(article: Omit<BlogArticle, 'id'>): Promise<Result<BlogArticle>> {
    const data = await this._graphqlFetch<{ createBlog: BlogArticle }>(
      `mutation CreateBlog($input: String!) {
        createBlog(input: $input) {
          id slug title description status views
        }
      }`,
      { input: typeof article === "string" ? article : JSON.stringify(article) }
    );
    if (data?.createBlog) return success(data.createBlog);
    return failure(new Error('Failed to create article'));
  }

  async updateArticle(id: string, updates: Partial<BlogArticle>): Promise<Result<BlogArticle>> {
    const data = await this._graphqlFetch<{ updateBlog: BlogArticle }>(
      `mutation UpdateBlog($id: ID!, $input: String!) {
        updateBlog(id: $id, input: $input) {
          id slug title description status views
        }
      }`,
      { id, input: typeof updates === "string" ? updates : JSON.stringify(updates) }
    );
    if (data?.updateBlog) return success(data.updateBlog);
    return failure(new Error('Failed to update article'));
  }

  async deleteArticle(id: string): Promise<Result<void>> {
    const data = await this._graphqlFetch<{ deleteBlog: { message: string } }>(
      `mutation DeleteBlog($id: ID!) {
        deleteBlog(id: $id) {
          message
        }
      }`,
      { id }
    );
    if (data?.deleteBlog) return success(undefined as any);
    return failure(new Error('Failed to delete article'));
  }

  async subscribeToNewsletter(email: string): Promise<Result<{ message: string; subscriber: NewsletterSubscriber }>> {
    const data = await this._graphqlFetch<{ newsletterSubscribe: { message: string; subscriber: NewsletterSubscriber } }>(
      `mutation NewsletterSubscribe($email: String!) {
        newsletterSubscribe(email: $email) {
          message
          subscriber { id email status subscribedAt }
        }
      }`,
      { email }
    );
    if (data?.newsletterSubscribe) return success(data.newsletterSubscribe);
    return failure(new Error('Failed to subscribe'));
  }

  async getNewsletterSubscribers(): Promise<Result<NewsletterSubscriber[]>> {
    const data = await this._graphqlFetch<{ newsletterSubscribers: NewsletterSubscriber[] }>(
      `query NewsletterSubscribers {
        newsletterSubscribers {
          id email status subscribedAt
        }
      }`
    );
    if (data?.newsletterSubscribers) return success(data.newsletterSubscribers);
    return failure(new Error('Failed to fetch subscribers'));
  }
}
