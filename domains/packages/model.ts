export interface PackageItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  price: string;
  icon: string;
  includedTests?: string[];
}

export interface PackageDetailData {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string;
  price: string;
  icon: string;
  includes: string[];
  whoShouldGet: string;
  preparation: string;
  relatedPackages: Array<{ title: string; category: string; description: string; slug: string }>;
  highlights: string[];
  includedTests?: string[];
}

export interface PackagesHero {
  title: string;
  description: string;
  image: string;
  pill: string;
}

export interface Benefit {
  title: string;
  description: string;
  icon: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface FeaturedPackage {
  slug: string;
  title: string;
  badgeText: string;
  badgeColor: string;
  benefit: string;
  highlightIcon: string;
  highlightText: string;
  price: string;
  ageGroups?: string[];
  includedTests?: string[];
}
