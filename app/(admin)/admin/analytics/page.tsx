'use client';

import React from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';

export default function AnalyticsPage() {
  return (
    <AdminPageTemplate
      title="Analytics"
      description="Revenue, bookings, and operational KPIs"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <AdminIcon name="chart" className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
        </div>
        <h3 className="text-[16px] font-semibold text-slate-900 mb-1">Analytics</h3>
        <p className="text-[13px] text-slate-500 text-center max-w-xs">Revenue trends, booking analytics, and operational KPIs will appear here.</p>
      </div>
    </AdminPageTemplate>
  );
}
