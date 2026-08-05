export interface TestItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  tag: string;
  description: string;
  price?: string;
}

export interface TestsHero {
  title: string;
  description: string;
  image: string;
}

export interface TestCategory {
  id: string;
  label: string;
}
