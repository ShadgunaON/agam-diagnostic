/**
 * Backend contract for a Blog Article.
 */
export interface BlogArticleDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  published_at: string;
  category: string;
  author_id: string;
  icon: string;
  color_primary: string;
  color_secondary: string;
  cover_image_url?: string;
}
