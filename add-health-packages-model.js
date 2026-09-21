const fs = require('fs');
const path = require('path');

const modelsPath = path.join(process.cwd(), 'domains', 'cms', 'models.ts');
let content = fs.readFileSync(modelsPath, 'utf8');

const healthPackagesContent = `
export interface HealthPackagesPageContent {
  hero?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
    primaryActionLabel?: string;
    primaryActionLink?: string;
    isVisible?: boolean;
  };
  preventiveCare?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    isVisible?: boolean;
  };
  benefits?: {
    title?: string;
    description?: string;
    eyebrow?: string;
    items?: Array<{
      title: string;
      description: string;
      icon: string;
      isVisible?: boolean;
      order?: number;
    }>;
    isVisible?: boolean;
  };
  process?: {
    title?: string;
    description?: string;
    eyebrow?: string;
    steps?: Array<{
      title: string;
      description: string;
      order?: number;
    }>;
    isVisible?: boolean;
  };
  category?: {
    title?: string;
    description?: string;
    eyebrow?: string;
    isVisible?: boolean;
  };
  featured?: {
    title?: string;
    description?: string;
    eyebrow?: string;
    packageIds?: string[];
    isVisible?: boolean;
  };
  advantage?: {
    title?: string;
    description?: string;
    eyebrow?: string;
    items?: Array<{
      title: string;
      description: string;
      icon: string;
      order?: number;
    }>;
    isVisible?: boolean;
  };
  bottomCta?: {
    title?: string;
    description?: string;
    primaryActionLabel?: string;
    primaryActionLink?: string;
    secondaryActionLabel?: string;
    secondaryActionLink?: string;
    isVisible?: boolean;
  };
}
`;

content = content + healthPackagesContent;
fs.writeFileSync(modelsPath, content);
console.log('Added HealthPackagesPageContent to domains/cms/models.ts');
