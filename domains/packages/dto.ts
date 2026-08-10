export interface PackageItemDto {
  id: string;
  url_slug: string;
  name: string;
  category_name: string;
  summary: string;
  cost: string;
  icon_name: string;
  included_tests_slugs?: string[];
}

export interface PackageDetailDto {
  id: string;
  url_slug: string;
  category_name: string;
  name: string;
  summary: string;
  cost?: string;
  icon_name: string;
  included_tests: string[];
  target_demographic: string;
  prep_instructions: string;
  related_packs: Array<{ name: string; category: string; desc: string; url_slug: string }>;
  key_highlights: string[];
  included_tests_slugs?: string[];
}
