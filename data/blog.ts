export interface BlogCategory {
  id: string;
  name: string;
  count: number;
}

export type AdminBlogArticle = {
  id: string;
  title: string;
  category: string;
  status: 'Published' | 'Draft';
  author: string;
  date: string;
  views: number;
  image: string;
};

export const mockAdminArticles: AdminBlogArticle[] = [
  { id: '1', title: 'Understanding Your Complete Blood Count (CBC) Results', category: 'Patient Education', status: 'Published', author: 'Dr. Sarah Jenkins', date: 'Aug 1, 2026', views: 1240, image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80' },
  { id: '2', title: 'The Future of Molecular Diagnostics in Preventive Care', category: 'Medical Research', status: 'Published', author: 'Dr. Robert Wilson', date: 'Jul 28, 2026', views: 890, image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=600&q=80' }
];

export interface BlogArticle {
  slug: string;
  category: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  colorPrimary: string;
  colorSecondary: string;
}

export interface BlogData {
  hero: {
    title: string;
    description: string;
  };
  categories: BlogCategory[];
  popularReads: Array<{
    slug: string;
    title: string;
    date: string;
    icon: string;
  }>;
  featuredArticle: BlogArticle;
  articles: BlogArticle[];
}

export const blogData: BlogData = {
  hero: {
    title: 'Health Insights & Articles',
    description: 'Expert advice, research updates, and wellness tips from our medical professionals.',
  },
  categories: [
    { id: 'health-wellness', name: 'Health & Wellness', count: 12 },
    { id: 'diagnostics', name: 'Diagnostics', count: 8 },
    { id: 'preventive-care', name: 'Preventive Care', count: 15 },
    { id: 'patient-education', name: 'Patient Education', count: 6 },
  ],
  popularReads: [
    {
      slug: 'understanding-hba1c',
      title: 'What is an HbA1c test?',
      date: 'June 12, 2026',
      icon: '🩸',
    },
    {
      slug: 'thyroid-diet-tips',
      title: 'Diet tips for Thyroid Patients',
      date: 'May 28, 2026',
      icon: '🥗',
    },
  ],
  featuredArticle: {
    slug: 'advanced-diagnostics-role',
    category: 'Diagnostics',
    title: 'The Role of Advanced Diagnostics in Modern Healthcare',
    description: 'How cutting-edge diagnostic technology is transforming patient care, improving early detection rates, and saving lives through precision medicine.',
    date: 'May 15, 2026',
    icon: '🔬',
    colorPrimary: '#D4E8FF',
    colorSecondary: '#E8F4FD',
  },
  articles: [
    {
      slug: 'understanding-blood-test-reports',
      category: 'Patient Education',
      title: 'Understanding Your Blood Test Reports',
      description: 'A simple guide to reading and understanding your diagnostic reports.',
      date: 'May 10, 2026',
      icon: '📊',
      colorPrimary: '#C8E6C9',
      colorSecondary: '#E8F5E9',
    },
    {
      slug: 'lifestyle-impacts-health',
      category: 'Health & Wellness',
      title: 'How Lifestyle Impacts Your Health',
      description: 'Understanding the connection between daily habits and long-term health outcomes.',
      date: 'May 05, 2026',
      icon: '🏃',
      colorPrimary: '#FFE0B2',
      colorSecondary: '#FFF3E0',
    },
    {
      slug: 'why-preventive-health-checkups-matter',
      category: 'Preventive Care',
      title: 'Why Preventive Health Checkups Matter',
      description: 'Regular health screenings can catch issues early and save lives.',
      date: 'May 01, 2026',
      icon: '🩺',
      colorPrimary: '#E1BEE7',
      colorSecondary: '#F3E5F5',
    },
    {
      slug: 'future-of-genetic-testing',
      category: 'Genetics',
      title: 'The Future of Genetic Testing',
      description: 'What your DNA can tell you about potential health risks and personalized care.',
      date: 'April 28, 2026',
      icon: '🧬',
      colorPrimary: '#BBDEFB',
      colorSecondary: '#E3F2FD',
    },
  ],
};

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  if (blogData.featuredArticle.slug === slug) return blogData.featuredArticle;
  return blogData.articles.find(article => article.slug === slug);
}
