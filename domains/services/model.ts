export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  shortDescription?: string;
  price: string;
  basePrice?: number;
  salePrice?: number;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  sortOrder?: number;
  
  // Medical & Detail Page Information
  estimatedDuration?: string;
  homeAvailable?: boolean;
  labAvailable?: boolean;
  overview?: string;
  whatIncludes?: string;
  whoItIsFor?: string;
  preparationRequired?: string;
  precautions?: string;
  whatToExpect?: string;
  additionalInstructions?: string;

  // Legacy detail data fields, will be deprecated/migrated
  valueProps?: Array<{ title: string; icon: string }>;
  aboutHtml?: string;
  whoShouldUse?: string[];
  process?: Array<{ title: string; description: string }>;
  preparation?: { title: string; description: string; icon: string };
  faqs?: Array<{ question: string; answer: string }>;
  relatedTests?: Array<{ title: string; category: string; description: string; slug: string }>;
  otherServices?: Array<{ title: string; slug: string }>;
  
  createdAt?: string;
  updatedAt?: string;
}

// Deprecated: use ServiceItem for all details now
export interface ServiceDetailData extends ServiceItem {
  originalPrice?: number;
}

export interface ServicesHero {
  title: string;
  description: string;
  image: string;
}
