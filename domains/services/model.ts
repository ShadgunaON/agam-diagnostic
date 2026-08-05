export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  price: string;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

export interface ServiceDetailData {
  id: string;
  slug: string;
  category: string;
  title: string;
  shortDescription: string;
  icon: string;
  valueProps: Array<{ title: string; icon: string }>;
  aboutHtml: string;
  whoShouldUse: string[];
  process: Array<{ title: string; description: string }>;
  preparation: { title: string; description: string; icon: string };
  faqs: Array<{ question: string; answer: string }>;
  relatedTests: Array<{ title: string; category: string; description: string; slug: string }>;
  otherServices: Array<{ title: string; slug: string }>;
}

export interface ServicesHero {
  title: string;
  description: string;
  image: string;
}
