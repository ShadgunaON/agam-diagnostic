export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  draftContent: string | null;
  publishedContent: string | null;
  draftSeo: string | null;
  publishedSeo: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  publishedAt?: string;
  publishedBy?: string;
}

export interface PageSeo {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export interface HomePageContent {
  hero: {
    eyebrow: string;
    heading: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    image: string;
    isVisible: boolean;
  };
  statistics: {
    isVisible: boolean;
    stats: Array<{ value: string; label: string; icon: string; }>;
  };
  diagnosticSolutions: {
    eyebrow: string;
    heading: string;
    description: string;
    serviceIds: string[];
    isVisible: boolean;
  };
  healthCheckupPlans: {
    eyebrow: string;
    heading: string;
    description: string;
    packageIds: string[];
    isVisible: boolean;
  };
  patientReviews: {
    eyebrow: string;
    heading: string;
    description: string;
    reviewIds: string[];
    isVisible: boolean;
  };
  qualityCare: {
    eyebrow: string;
    heading: string;
    description: string;
    features: Array<{ title: string; description: string; icon: string; }>;
    isVisible: boolean;
  };
  healthArticles: {
    eyebrow: string;
    heading: string;
    description: string;
    blogIds: string[];
    ctaText: string;
    ctaLink: string;
    isVisible: boolean;
  };
  mainLab: {
    eyebrow: string;
    heading: string;
    description: string;
    name: string;
    address: string;
    phone: string;
    hours: string;
    image: string;
    mapLink: string;
    bookingCtaText: string;
    bookingCtaLink: string;
    directionCtaText: string;
    directionCtaLink: string;
    isVisible: boolean;
  };
  faq: {
    eyebrow: string;
    heading: string;
    description: string;
    faqIds: string[]; // Reference to FAQs if a distinct FAQ model exists, otherwise custom objects
    faqs?: Array<{ question: string; answer: string; }>; // Fallback if no FAQ entity exists
    isVisible: boolean;
  };
  bookingCta: {
    heading: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    isVisible: boolean;
  };
}
