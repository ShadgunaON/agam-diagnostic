const fs = require('fs');
const files = [
  'app/(public)/page.tsx',
  'app/(admin)/admin/website/pages/home/preview/page.tsx',
  'app/(admin)/admin/website/pages/home/page.tsx'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/\\`/g, '`');
  c = c.replace(/\\\$/g, '$');
  fs.writeFileSync(f, c);
});
console.log('Fixed syntax escaping in files');
