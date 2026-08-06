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
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: '#f8fafc', position: 'relative' }}>
      {/* Background decoration for glassmorphism */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-blue-50/40 to-transparent pointer-events-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '300px', background: 'linear-gradient(180deg, rgba(239, 246, 255, 0.4) 0%, transparent 100%)', pointerEvents: 'none' }} />

      {/* KPI Section */}
      {kpiSection && (
        <div className="pt-6 md:pt-12 pb-6 md:pb-8 shrink-0 px-4 md:px-6" style={{ paddingTop: '48px', paddingBottom: '32px', flexShrink: 0, paddingLeft: '40px', paddingRight: '40px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
          {kpiSection}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pt-0 pb-32 custom-scrollbar bg-transparent px-4 md:px-6" style={{ flex: 1, overflowY: 'auto', paddingTop: 0, paddingBottom: '128px', backgroundColor: 'transparent', paddingLeft: '40px', paddingRight: '40px' }}>
        <div className="max-w-[1600px] mx-auto w-full" style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
