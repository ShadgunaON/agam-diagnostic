export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category: string;
  authorId: string;
  icon: string;
  colorPrimary: string;
  colorSecondary: string;
  imageUrl?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  count: number;
}

export interface BlogHero {
  title: string;
  description: string;
}

export interface PopularRead {
  slug: string;
  title: string;
  date: string;
  icon: string;
}
