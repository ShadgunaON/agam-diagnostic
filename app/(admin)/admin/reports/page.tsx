'use client';

import React from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminCard } from '@/components/admin/primitives/AdminCard';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { reportsData } from '@/data/admin/mockReports';

export default function ReportsPage() {
  return (
    <AdminPageTemplate>
      <div style={{ marginBottom: '40px' }}>
        <AdminCard padding="none" className="overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col lg:flex-row h-full min-h-[500px]">
            {/* Kanban Columns */}
            <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory">
              {['Pending', 'Processing', 'Ready', 'Delivered'].map((status, index) => (
                <div key={status} className="flex-1 min-w-[280px] snap-center border-r border-slate-200 bg-slate-50/30 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[14px] font-bold text-slate-800">{status}</div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {reportsData.filter(r => r.status === status).length}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {reportsData
                      .filter(r => r.status === status)
                      .map((report) => (
                        <div key={report.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-[0_4px_12px_rgb(0,0,0,0.05)] hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-slate-400 font-mono">{report.id}</span>
                            <span className="text-[11px] font-medium text-slate-500">{report.time}</span>
                          </div>
                          <div className="text-[13px] font-semibold text-slate-900 mb-1 leading-tight">{report.patient}</div>
                          <div className="text-[12px] font-medium text-slate-500 mb-3">{report.test}</div>
                          
                          {status === 'Ready' && (
                            <button className="w-full mt-2 py-1.5 text-[12px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors text-center border border-emerald-200">
                              Verify & Publish
                            </button>
                          )}
                        </div>
                      ))}
                    {reportsData.filter(r => r.status === status).length === 0 && (
                      <div className="h-32 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center">
                        <span className="text-[13px] font-medium text-slate-400">No reports in {status}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminPageTemplate>
  );
}


