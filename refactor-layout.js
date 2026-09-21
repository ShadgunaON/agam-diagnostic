const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app', '(admin)', 'admin', 'website', 'pages', 'health-packages', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure useSearchParams is imported
if (!content.includes("import { useSearchParams }")) {
  content = content.replace(
    /import React, \{ useState, useEffect \} from 'react';/,
    "import React, { useState, useEffect } from 'react';\nimport { useSearchParams } from 'next/navigation';"
  );
}
// Add CheckCircle and AlertCircle icons if not present
if (!content.includes("CheckCircle")) {
  content = content.replace(
    /import \{ Save, Globe, Eye, Plus, Trash2, GripVertical \} from 'lucide-react';/,
    "import { Save, Globe, Eye, Plus, Trash2, GripVertical, CheckCircle, AlertCircle } from 'lucide-react';"
  );
}

// Extract all sections
const sectionRegex = /\{\/\*\s*([A-Z0-9\s]+)\s*\*\/\}\s*<section id="([a-zA-Z0-9]+)">([\s\S]*?)<\/section>/g;
const sections = {};
let match;
while ((match = sectionRegex.exec(content)) !== null) {
  sections[match[2]] = match[3].trim();
}

// Create renderActiveSection function
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
            
            <CMSSectionContainer title="Available Sections">
              <div className="divide-y divide-gray-100">
                {['Hero', 'Preventive Care', 'Benefits', 'Process', 'Category', 'Featured', 'Advantage', 'Bottom CTA'].map(sec => (
                  <div key={sec} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <span className="text-sm font-medium text-gray-900">{sec}</span>
                  </div>
                ))}
              </div>
            </CMSSectionContainer>
          </div>
        );
`;

for (const id in sections) {
  renderActiveSectionStr += `
      case '${id}':
        return (
          <div className="space-y-6">
            ${sections[id]}
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

// Now we need to replace the return statement of HealthPackagesCMSPage
const componentStartIndex = content.indexOf('export default function HealthPackagesCMSPage() {');
const hooksEndRegex = /if \(loading\)/;
const hooksEndMatch = hooksEndRegex.exec(content);

// We need to inject useSearchParams right after the function starts
const functionBodyStart = content.indexOf('{', componentStartIndex) + 1;
const contentBeforeHooks = content.substring(0, functionBodyStart);
const contentAfterHooksStart = content.substring(functionBodyStart);

// Let's replace the whole function instead of string hacking, it's safer.
const fullReturnRegex = /return \([\s\S]*?\n\s*\);\n\}/;
const newFunctionEnd = `
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

// Insert useSearchParams inside component
let finalContent = content.replace(
  /export default function HealthPackagesCMSPage\(\) \{/,
  "export default function HealthPackagesCMSPage() {\n  const searchParams = useSearchParams();\n  const activeSection = searchParams.get('section') || 'overview';"
);

// Replace the return block
// To do this, I will find the first `if (loading)` block and replace everything from there to the end.
const loadingIndex = finalContent.indexOf('if (loading) {');
finalContent = finalContent.substring(0, loadingIndex) + renderActiveSectionStr + newFunctionEnd;

fs.writeFileSync(filePath, finalContent);
console.log('Successfully refactored layout');
