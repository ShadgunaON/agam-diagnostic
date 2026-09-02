export interface PackageItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  price: string;
  packagePrice?: number;
  individualValue?: number;
  icon: string;
  testIds?: string[];
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  sortOrder?: number;
  
  // Detail Page Information
  overview?: string;
  whoShouldConsider?: string;
  preparation?: string;
  fastingRequirements?: string;
  precautions?: string;
  reportTurnaround?: string;
  additionalInstructions?: string;
  
  // Legacy detail data fields, will be deprecated/migrated
  includes?: string[];
  relatedPackages?: Array<{ title: string; category: string; description: string; slug: string }>;
  highlights?: string[];
  includedTests?: string[];
  
  createdAt?: string;
  updatedAt?: string;
}

// Deprecated: use PackageItem for all details now
export interface PackageDetailData extends PackageItem {
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
