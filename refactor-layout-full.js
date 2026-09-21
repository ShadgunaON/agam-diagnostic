const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app', '(admin)', 'admin', 'website', 'pages', 'health-packages', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add use client and useSearchParams
content = content.replace(
  /import React, \{ useState, useEffect \} from 'react';/,
  `"use client";\n\nimport React, { useState, useEffect } from 'react';\nimport { useSearchParams } from 'next/navigation';`
);

// 2. Fix packageService import
content = content.replace(
  /import \{ serviceCatalogService \} from '@\/services';/,
  `import { packageService } from '@/services';`
);

// 3. Fix catalog fetch
content = content.replace(
  /const res = await serviceCatalogService\.getCatalog\(1, 100, 'package'\);/,
  `const res = await packageService.getCatalog(1, 100);`
);

// 4. Change AdminButton variants
content = content.replace(/variant="outline"/g, `variant="secondary"`);

// 5. Replace the imports and insert missing components
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
content = content.replace(
  /import \{ Save, Globe, Eye, Plus, Trash2, GripVertical \} from 'lucide-react';/,
  "import { Save, Globe, Eye, Plus, Trash2, GripVertical, CheckCircle, AlertCircle } from 'lucide-react';"
);

const missingComponents = `
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

// Now, we will inject useSearchParams and replace the return block with the switch structure
content = content.replace(
  /export default function HealthPackagesCMSPage\(\) \{/,
  "export default function HealthPackagesCMSPage() {\n  const searchParams = useSearchParams();\n  const activeSection = searchParams.get('section') || 'overview';"
);

// We find the <div className="space-y-12 pb-24 max-w-5xl"> which wraps all sections,
// and we will replace everything from `<AdminPageLayout` up to the end of the file.

const functionReturnStartRegex = /return \([\s\S]*?<AdminPageLayout[\s\S]*?headerActions=\{/;
const headerActionsEndRegex = /<div className="space-y-12 pb-24 max-w-5xl">/;

// I will extract each section by doing split on `<section id="`
// The content inside <div className="space-y-12 pb-24 max-w-5xl"> looks like this:
// <section id="hero">...</section>
// <section id="preventiveCare">...</section>
// ...
const wrapperStart = content.indexOf('<div className="space-y-12 pb-24 max-w-5xl">');
const wrapperContentStart = wrapperStart + '<div className="space-y-12 pb-24 max-w-5xl">'.length;
const wrapperContentEnd = content.lastIndexOf('</div>\n      </AdminPageLayout>\n    );\n}');

const allSectionsRaw = content.substring(wrapperContentStart, wrapperContentEnd);
const sectionRegex = /<section id="([a-zA-Z0-9_]+)">([\s\S]*?)<\/section>/g;

const sectionsMap = {};
let match;
while ((match = sectionRegex.exec(allSectionsRaw)) !== null) {
  sectionsMap[match[1]] = match[2].trim();
}

let renderActiveSectionStr = `
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <SectionHeader title="Health Packages Page Overview" description="Current status and content summary" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {hasUnpublishedChanges ? (
                      <span className="flex items-center gap-1.5 text-amber-600 font-semibold text-sm">
                        <AlertCircle className="w-4 h-4" /> Draft Saved
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-green-600 font-semibold text-sm">
                        <CheckCircle className="w-4 h-4" /> Published
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
`;

for (const id in sectionsMap) {
  renderActiveSectionStr += `
      case '${id}':
        return (
          <div className="space-y-6">
            ${sectionsMap[id]}
          </div>
        );
`;
}

renderActiveSectionStr += `
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-lg font-medium">Select a section to edit</p>
          </div>
        );
    }
  };
`;

const loadingIndex = content.indexOf('if (loading) {');
const newEnd = `
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading editor...</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              Health Packages CMS
              {page?.status === 'PUBLISHED' && !hasUnpublishedChanges && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  LIVE
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage public-facing content for the Health Packages page</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/preview/health-packages"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            Preview Draft
          </a>
          <AdminButton
            variant="ghost"
            onClick={handleSaveDraft}
            isLoading={saving}
          >
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </AdminButton>
          <AdminButton
            variant="primary"
            onClick={handlePublish}
            isLoading={saving}
            disabled={!hasUnpublishedChanges}
            className={hasUnpublishedChanges ? 'animate-pulse-subtle shadow-blue-500/20 shadow-lg ring-2 ring-blue-500/20' : ''}
          >
            <Globe className="w-4 h-4 mr-2" /> Publish to Live
          </AdminButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
}
`;

content = content.substring(0, loadingIndex) + renderActiveSectionStr + newEnd;

fs.writeFileSync(filePath, content);
console.log('Done rewriting file.');
