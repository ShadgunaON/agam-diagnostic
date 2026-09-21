const fs = require('fs');
const path = require('path');

const adminPagePath = path.join(process.cwd(), 'app', '(admin)', 'admin', 'website', 'pages', 'health-packages', 'page.tsx');
let adminContent = fs.readFileSync(adminPagePath, 'utf8');

adminContent = '"use client";\n\n' + adminContent;

fs.writeFileSync(adminPagePath, adminContent);
console.log('Added use client');
