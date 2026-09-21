const fs = require('fs');
const path = require('path');

// Fix 1: app/(admin)/admin/website/pages/health-packages/page.tsx
const adminPagePath = path.join(process.cwd(), 'app', '(admin)', 'admin', 'website', 'pages', 'health-packages', 'page.tsx');
let adminContent = fs.readFileSync(adminPagePath, 'utf8');

adminContent = adminContent.replace(
  /import \{ packageService \} from '@\/services\/PackageService';/,
  `import { packageService } from '@/services';`
);

fs.writeFileSync(adminPagePath, adminContent);
console.log('Fixed admin page imports');

// Fix 2: app/(public)/health-packages/page.tsx
const publicPagePath = path.join(process.cwd(), 'app', '(public)', 'health-packages', 'page.tsx');
let publicContent = fs.readFileSync(publicPagePath, 'utf8');

publicContent = publicContent.replace(
  /benefit: ''/g,
  `benefit: '',\n        badgeText: '',\n        badgeColor: '',\n        highlightIcon: ''`
);
fs.writeFileSync(publicPagePath, publicContent);
console.log('Fixed public page errors');

// Fix 3: app/(public)/preview/health-packages/page.tsx
const previewPagePath = path.join(process.cwd(), 'app', '(public)', 'preview', 'health-packages', 'page.tsx');
let previewContent = fs.readFileSync(previewPagePath, 'utf8');

previewContent = previewContent.replace(
  /benefit: ''/g,
  `benefit: '',\n        badgeText: '',\n        badgeColor: '',\n        highlightIcon: ''`
);
fs.writeFileSync(previewPagePath, previewContent);
console.log('Fixed preview page errors');
