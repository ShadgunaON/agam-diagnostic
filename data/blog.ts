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
  imageUrl?: string;
  content?: string;
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
    imageUrl?: string;
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
      slug: 'understanding-blood-test-reports',
      title: 'Understanding Your Blood Test Reports',
      date: 'May 10, 2026',
      icon: '📊',
      imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
    },
    {
      slug: 'why-preventive-health-checkups-matter',
      title: 'Why Preventive Health Checkups Matter',
      date: 'May 01, 2026',
      icon: '🩺',
      imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
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
    imageUrl: '/images/blog_lab.png',
    content: `
      <h2>The Evolution of Diagnostics</h2>
      <p>In recent years, the medical field has seen a massive shift towards precision medicine, largely driven by advancements in diagnostic technology. Traditional methods, while effective, often rely on generalized markers. Today's advanced diagnostics dig deeper into the molecular and genetic makeup of a patient.</p>
      <h3>Why It Matters</h3>
      <p>Advanced diagnostics allow for earlier detection of diseases such as cancer and autoimmune disorders. This early intervention is crucial for improving survival rates and tailoring treatments specifically to the individual.</p>
    `,
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
      imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
      content: `
        <p>Receiving a medical report can sometimes feel like trying to decipher a foreign language. The array of numbers, acronyms, and reference ranges can be overwhelming. However, having a basic understanding of what these terms mean empowers you to take a more active role in your healthcare.</p>
        <h2>The Basics: Reference Ranges</h2>
        <p>Next to almost every test result on your report, you will see a column typically labeled "Reference Range" or "Normal Range." This range represents the values found in 95% of the healthy population.</p>
        <p>It's important to remember that falling slightly outside a reference range doesn't automatically mean you are ill. Various factors, including your age, sex, diet, and even the time of day the blood was drawn, can affect these numbers. Always discuss out-of-range results with your physician.</p>
        <h2>Common Blood Test Components</h2>
        <h3>1. Complete Blood Count (CBC)</h3>
        <p>The CBC is one of the most common blood tests. It evaluates the cells that circulate in your blood:</p>
        <ul>
          <li><strong>Red Blood Cells (RBCs):</strong> Carry oxygen. Low levels can indicate anemia.</li>
          <li><strong>White Blood Cells (WBCs):</strong> Fight infection. High levels might indicate an active infection or inflammation.</li>
          <li><strong>Platelets:</strong> Essential for blood clotting.</li>
          <li><strong>Hemoglobin (Hb):</strong> The oxygen-carrying protein in RBCs.</li>
        </ul>
        <h3>2. Comprehensive Metabolic Panel (CMP)</h3>
        <p>This test provides a snapshot of your body's chemical balance and metabolism, offering insights into your kidney and liver health, as well as blood sugar and electrolyte levels.</p>
      `,
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
      imageUrl: '/images/blog_lifestyle.png',
      content: `
        <h2>The Impact of Daily Choices</h2>
        <p>Your daily habits—what you eat, how much you sleep, and your activity levels—have a profound impact on your overall health. Many chronic conditions are linked directly to lifestyle choices.</p>
        <p>Making small, sustainable changes can lead to significant improvements in your well-being over time.</p>
      `,
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
      imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
      content: `
        <h2>Prevention Over Cure</h2>
        <p>Preventive health checkups are designed to identify potential health issues before they become serious problems. By catching conditions early, treatments are often more effective and less invasive.</p>
      `,
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
      imageUrl: '/images/blog_heart.png',
      content: `
        <h2>Unlocking Your DNA</h2>
        <p>Genetic testing has become increasingly accessible, offering unprecedented insights into individual health risks. By analyzing your DNA, healthcare providers can offer personalized recommendations for disease prevention and treatment.</p>
      `,
    },
    {
      slug: 'understanding-hba1c',
      category: 'Diagnostics',
      title: 'What is an HbA1c test?',
      description: 'Understanding the importance of HbA1c testing for blood sugar management.',
      date: 'June 12, 2026',
      icon: '🩸',
      colorPrimary: '#FFCDD2',
      colorSecondary: '#FFEBEE',
      imageUrl: '/images/blog_heart.png',
      content: `
        <h2>Decoding Your Blood Sugar</h2>
        <p>The HbA1c test measures your average blood sugar levels over the past two to three months. It is an essential tool for diagnosing and managing diabetes.</p>
      `,
    },
  ],
};

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  if (blogData.featuredArticle.slug === slug) return blogData.featuredArticle;
  return blogData.articles.find(article => article.slug === slug);
}
