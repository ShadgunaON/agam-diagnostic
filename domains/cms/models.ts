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

export type FeatureVariant = 'blue' | 'purple' | 'green' | 'orange' | string;

export interface AboutPageContent {
  hero?: {
    isVisible?: boolean;
    title?: string;
    description?: string;
    image?: string;
    badges?: string[];
  };
  trustFeatures?: {
    isVisible?: boolean;
    items?: Array<{ title: string; description: string; icon: string }>;
  };
  story?: {
    isVisible?: boolean;
    title?: string;
    paragraphs?: string[];
    image?: string;
    stat?: { value: string; label: string };
  };
  missionVision?: {
    isVisible?: boolean;
    mission?: { title: string; description: string };
    vision?: { title: string; description: string };
  };
  differenceFeatures?: {
    isVisible?: boolean;
    items?: Array<{ title: string; description: string; variant: FeatureVariant }>;
  };
  milestones?: {
    isVisible?: boolean;
    items?: Array<{ year: string; title: string; progress: number; description: string; variant: FeatureVariant }>;
  };
  techFeatures?: {
    isVisible?: boolean;
    items?: Array<{ title: string; description: string; variant: FeatureVariant }>;
  };
  team?: {
    isVisible?: boolean;
    members?: Array<{ name: string; role: string; qualification: string; image: string }>;
  };
  recognitions?: {
    isVisible?: boolean;
    accreditations?: {
      title?: string;
      intro?: string;
      items?: Array<{ title: string; description: string }>;
    };
    awards?: {
      title?: string;
      items?: Array<{ title: string; category: string; description: string }>;
    };
  };
  contactPreview?: {
    isVisible?: boolean;
  };
  reviewsCta?: {
    isVisible?: boolean;
    eyebrow?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
  };
  bottomCta?: {
    isVisible?: boolean;
    title?: string;
    description?: string;
    primaryActionLabel?: string;
    primaryActionLink?: string;
  };
}
