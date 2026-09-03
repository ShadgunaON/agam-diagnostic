export interface TestItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  tag: string;
  description: string;
  price?: string;
  basePrice?: number;
  salePrice?: number;
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  sortOrder?: number;
  
  // Medical Information
  sampleType?: string;
  sampleVolume?: string;
  turnaroundTime?: string;
  fastingRequired?: boolean;
  homeCollectionAvailable?: boolean;
  labCollectionAvailable?: boolean;

  // Detail Page Information
  overview?: string;
  whatItChecks?: string;
  whyPerformed?: string;
  preparationRequired?: string;
  precautions?: string;
  sampleInfo?: string;
  reportTiming?: string;
  additionalInstructions?: string;

  // Legacy detail data fields, will be deprecated/migrated
  whoShouldGet?: string;
  preparation?: string;
  faqs?: Array<{ question: string; answer: string }>;
  /**
   * Manually curated related tests — stored as a display snapshot.
   * status is snapshotted at curation time (always 'ACTIVE' from the picker).
   * If a related test is later deactivated, re-save this test to refresh the list.
   */
  relatedTests?: Array<{ title: string; category: string; description: string; slug: string; status?: string }>;

  createdAt?: string;
  updatedAt?: string;
}

// Deprecated: use TestItem for all details now
export interface TestDetailData extends TestItem {
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
