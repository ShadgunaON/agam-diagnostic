const fs = require('fs');
const path = require('path');

// Fix 1: app/(admin)/admin/website/pages/health-packages/page.tsx
const adminPagePath = path.join(process.cwd(), 'app', '(admin)', 'admin', 'website', 'pages', 'health-packages', 'page.tsx');
let adminContent = fs.readFileSync(adminPagePath, 'utf8');

adminContent = adminContent.replace(
  /import \{ serviceCatalogService \} from '@\/services';/,
  `import { packageService } from '@/services/PackageService';`
);

adminContent = adminContent.replace(
  /const res = await serviceCatalogService\.getCatalog\(1, 100, 'package'\);/,
  `const res = await packageService.getCatalog(1, 100);`
);

adminContent = adminContent.replace(
  /variant="outline"/g,
  `variant="secondary"`
);

fs.writeFileSync(adminPagePath, adminContent);
console.log('Fixed admin page errors');

// Fix 2: app/(public)/health-packages/page.tsx
const publicPagePath = path.join(process.cwd(), 'app', '(public)', 'health-packages', 'page.tsx');
let publicContent = fs.readFileSync(publicPagePath, 'utf8');

publicContent = publicContent.replace(
  /const heroData = content\?\.hero \|\| fallbackHero\.value;/,
  `const heroData = content?.hero || (fallbackHero.isSuccess ? fallbackHero.value : null);`
);
publicContent = publicContent.replace(
  /const benefitsData = content\?\.benefits \|\| \{ items: fallbackBenefits\.value \};/,
  `const benefitsData = content?.benefits || { items: fallbackBenefits.isSuccess ? fallbackBenefits.value : [] };`
);
publicContent = publicContent.replace(
  /const processData = content\?\.process \|\| \{ steps: fallbackProcess\.value \};/,
  `const processData = content?.process || { steps: fallbackProcess.isSuccess ? fallbackProcess.value : [] };`
);
publicContent = publicContent.replace(
  /let featuredPackages = fallbackFeatured\.value \|\| \[\];/,
  `let featuredPackages = fallbackFeatured.isSuccess ? fallbackFeatured.value : [];`
);
fs.writeFileSync(publicPagePath, publicContent);
console.log('Fixed public page errors');

// Fix 3: app/(public)/preview/health-packages/page.tsx
const previewPagePath = path.join(process.cwd(), 'app', '(public)', 'preview', 'health-packages', 'page.tsx');
let previewContent = fs.readFileSync(previewPagePath, 'utf8');

previewContent = previewContent.replace(
  /const heroData = content\?\.hero \|\| fallbackHero\.value;/,
  `const heroData = content?.hero || (fallbackHero.isSuccess ? fallbackHero.value : null);`
);
previewContent = previewContent.replace(
  /const benefitsData = content\?\.benefits \|\| \{ items: fallbackBenefits\.value \};/,
  `const benefitsData = content?.benefits || { items: fallbackBenefits.isSuccess ? fallbackBenefits.value : [] };`
);
previewContent = previewContent.replace(
  /const processData = content\?\.process \|\| \{ steps: fallbackProcess\.value \};/,
  `const processData = content?.process || { steps: fallbackProcess.isSuccess ? fallbackProcess.value : [] };`
);
previewContent = previewContent.replace(
  /let featuredPackages = fallbackFeatured\.value \|\| \[\];/,
  `let featuredPackages = fallbackFeatured.isSuccess ? fallbackFeatured.value : [];`
);
fs.writeFileSync(previewPagePath, previewContent);
console.log('Fixed preview page errors');

// Fix 4: components/sections/packages/PackagesHeroSection.tsx
const heroSectionPath = path.join(process.cwd(), 'components', 'sections', 'packages', 'PackagesHeroSection.tsx');
let heroContent = fs.readFileSync(heroSectionPath, 'utf8');

heroContent = heroContent.replace(
  /<Button asChild className="btn btn--primary">/,
  `<Button href={data.primaryActionLink || "/book"} className="btn btn--primary">`
);
heroContent = heroContent.replace(
  /<\s*Link href=\{data\.primaryActionLink \|\| "\/book"\}\s*>\s*\{data\.primaryActionLabel \|\| "Book Appointment"\}\s*<\/\s*Link\s*>/,
  `{data.primaryActionLabel || "Book Appointment"}`
);
fs.writeFileSync(heroSectionPath, heroContent);
console.log('Fixed hero section errors');
