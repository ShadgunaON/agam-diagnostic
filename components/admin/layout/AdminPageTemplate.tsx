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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-transparent w-full">
        <div className="mx-auto w-full max-w-[1440px]">
          {/* Header Section */}
          {(title || description || headerActions) && (
            <div className="pt-8 pb-6 px-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {title && <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>}
                {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
              </div>
              {headerActions && (
                <div className="flex items-center gap-3 shrink-0">
                  {headerActions}
                </div>
              )}
            </div>
          )}

          {/* Toolbar */}
          {toolbar && (
            <div className="px-4 md:px-6 pb-6">
              {toolbar}
            </div>
          )}

          {/* KPI Section */}
          {kpiSection && (
            <div className="pt-2 pb-6 md:pb-8 shrink-0 px-4 md:px-6">
              {kpiSection}
            </div>
          )}

          <div className="pt-0 pb-32 px-4 md:px-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
