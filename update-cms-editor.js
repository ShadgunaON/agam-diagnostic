const fs = require('fs');
const path = require('path');

const pagePath = path.join(process.cwd(), 'app', '(admin)', 'admin', 'website', 'pages', 'health-packages', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Replace imports
content = content.replace(
  /import \{\s*AdminPageLayout,\s*CMSSectionContainer,\s*SectionHeader\s*\} from '@\/components\/admin\/layout';/,
  ''
);
content = content.replace(
  /import \{\s*AdminInput,\s*AdminTextarea,\s*AdminButton,\s*AdminImageEditor,\s*AdminIconPicker,\s*VisibilityToggle\s*\} from '@\/components\/admin\/ui';/,
  `import { AdminInput } from '@/components/admin/primitives/AdminInput';
import { AdminButton } from '@/components/admin/primitives/AdminButton';
import { AdminIconPicker } from '@/components/admin/cms/AdminIconPicker';
import { AdminImageEditor } from '@/components/admin/cms/AdminImageEditor';`
);

// Add missing components at the top
const missingComponents = `
function AdminPageLayout({ title, description, headerActions, children }: { title: string, description: string, headerActions: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="flex-1 p-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          {headerActions}
        </div>
        {children}
      </div>
    </div>
  );
}

function SectionHeader({ title, description, isVisible }: { title: string; description?: string; isVisible?: boolean }) {
  return (
    <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-100">
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      {isVisible !== undefined && (
        <div className={\`px-2 py-1 rounded text-xs font-medium \${isVisible ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}\`}>
          {isVisible ? 'Visible' : 'Hidden'}
        </div>
      )}
    </div>
  );
}

function CMSSectionContainer({ title, description, children, rightElement }: { title: string; description?: string; children?: React.ReactNode; rightElement?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}

function VisibilityToggle({ value, onChange }: { value: boolean; onChange: (val: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <span className="text-sm font-medium text-gray-700">{value ? 'Visible' : 'Hidden'}</span>
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <div className={\`block w-10 h-6 rounded-full transition-colors \${value ? 'bg-green-500' : 'bg-gray-300'}\`}></div>
        <div className={\`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform \${value ? 'translate-x-4' : ''}\`}></div>
      </div>
    </label>
  );
}

function AdminTextarea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (val: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  );
}
`;

content = content.replace('const DEFAULT_CONTENT', missingComponents + '\n\nconst DEFAULT_CONTENT');

fs.writeFileSync(pagePath, content);
console.log('Fixed CMS editor imports');
