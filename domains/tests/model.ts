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

export interface TestDetailData {
  slug: string;
  category: string;
  title: string;
  description: string;
  price: string;
  tag: string;
  whoShouldGet: string;
  preparation: string;
  turnaroundTime: string;
  faqs: Array<{ question: string; answer: string }>;
  relatedTests: Array<{ title: string; category: string; description: string; slug: string }>;
}
