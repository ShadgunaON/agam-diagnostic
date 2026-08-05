import React from 'react';

interface AdminPageTemplateProps {
  title?: string;
  description?: string;
  headerActions?: React.ReactNode;
  kpiSection?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

export function AdminPageTemplate({
  title,
  description,
  headerActions,
  kpiSection,
  toolbar,
  children
}: AdminPageTemplateProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative">
      {/* Background decoration for glassmorphism */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-blue-50/40 to-transparent pointer-events-none" />

      {/* KPI Section */}
      {kpiSection && (
        <div
          className="pt-12 pb-8 shrink-0"
          style={{ paddingLeft: '24px', paddingRight: '24px' }}
        >
          {kpiSection}
        </div>
      )}

      {/* Main Content Area */}
      <div
        className="flex-1 overflow-y-auto pt-0 pb-32 custom-scrollbar bg-transparent"
        style={{ paddingLeft: '24px', paddingRight: '24px' }}
      >
        <div className="max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
