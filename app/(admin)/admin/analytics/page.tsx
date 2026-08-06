'use client';

import React from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { KPICard } from '@/components/admin/layout/KPICard';
import { AdminCard } from '@/components/admin/primitives/AdminCard';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { analyticsData } from '@/data/admin/mockAnalytics';

export default function AnalyticsPage() {
  const kpiSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {analyticsData.kpis.map((kpi, idx) => (
        <KPICard
          key={idx}
          title={kpi.label}
          value={kpi.value}
          icon={idx === 0 ? "creditCard" : idx === 1 ? "testTube" : idx === 2 ? "users" : "mapPin"}
          trend={{ 
            value: parseInt(kpi.change.replace(/[^0-9]/g, '')), 
            isPositive: kpi.trend === 'up',
            label: 'vs last month' 
          }}
        />
      ))}
    </div>
  );

  return (
    <AdminPageTemplate kpiSection={kpiSection}>
      <div style={{ marginBottom: '40px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Revenue Chart Placeholder */}
          <AdminCard padding="none" className="overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-xl border border-slate-200 bg-white lg:col-span-2">
            <div className="flex justify-between items-center py-6 px-8 border-b border-slate-200">
              <div className="text-[14px] font-bold text-slate-800 uppercase tracking-wider">Revenue Growth (YTD)</div>
              <button className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg">
                View Report
              </button>
            </div>
            
            <div style={{ padding: '32px' }}>
              <div className="relative h-64 w-full flex items-end justify-between gap-2 px-2">
                {/* Dummy SVG Bar Chart */}
                {analyticsData.revenueByMonth.map((item, idx) => {
                  const max = Math.max(...analyticsData.revenueByMonth.map(d => d.revenue));
                  const height = (item.revenue / max) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center justify-end w-full h-full group">
                      <div 
                        className="w-full bg-blue-100 group-hover:bg-blue-500 transition-colors rounded-t-md relative"
                        style={{ height: `${height}%` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] px-2 py-1 rounded shadow-lg whitespace-nowrap transition-opacity">
                          ₹{(item.revenue / 1000).toFixed(0)}k
                        </div>
                      </div>
                      <span className="text-[12px] font-medium text-slate-500 mt-3">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </AdminCard>

          {/* Test Distribution Doughnut Placeholder */}
          <AdminCard padding="none" className="overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-xl border border-slate-200 bg-white">
            <div className="py-6 px-8 border-b border-slate-200">
              <div className="text-[14px] font-bold text-slate-800 uppercase tracking-wider">Test Distribution</div>
            </div>
            <div style={{ padding: '32px' }}>
              <div className="relative h-48 w-full flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="20" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="113 251" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="75 251" strokeDashoffset="-113" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="20" strokeDasharray="37 251" strokeDashoffset="-188" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="26 251" strokeDashoffset="-225" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[20px] font-bold text-slate-900">1,248</span>
                  <span className="text-[11px] font-medium text-slate-500">Total Tests</span>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col gap-4">
                {analyticsData.testDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500'][idx]}`} />
                      <span className="text-[13px] font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-[13px] font-bold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </AdminPageTemplate>
  );
}



