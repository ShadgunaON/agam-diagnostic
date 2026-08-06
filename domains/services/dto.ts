export interface ServiceItemDto {
  id: string;
  slug: string;
  name: string;
  category_name: string;
  description_short: string;
  price_inr: string;
  icon_name: string;
  brand_color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

export interface ServiceDetailDto {
  id: string;
  slug: string;
  category_name: string;
  name: string;
  description_short: string;
  price_inr?: string;
  icon_name: string;
  value_propositions: Array<{ label: string; icon: string }>;
  about_html_content: string;
  target_audience: string[];
  workflow_steps: Array<{ step_title: string; step_desc: string }>;
  prep_requirements: { label: string; details: string; icon: string };
  faqs: Array<{ q: string; a: string }>;
  related_tests: Array<{ name: string; category: string; desc: string; url_slug: string }>;
  cross_sell_services: Array<{ name: string; url_slug: string }>;
}
