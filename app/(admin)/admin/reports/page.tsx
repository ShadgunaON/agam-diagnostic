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
            <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory" style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '24px' }}>
              {['Pending', 'Processing', 'Ready', 'Delivered'].map((status, index) => (
                <div key={status} className="flex-1 min-w-[280px] snap-center border-r border-slate-200 bg-slate-50/30 p-4" style={{ flex: 1, minWidth: '280px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                  <div className="flex items-center justify-between mb-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div className="text-[14px] font-bold text-slate-800" style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{status}</div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full" style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', backgroundColor: '#e2e8f0', padding: '4px 10px', borderRadius: '9999px' }}>
                      {reportsData.filter(r => r.status === status).length}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    {reportsData
                      .filter(r => r.status === status)
                      .map((report) => (
                        <div key={report.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-[0_4px_12px_rgb(0,0,0,0.05)] hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}>
                          <div className="flex justify-between items-start mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <span className="text-[10px] font-bold text-slate-400 font-mono" style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>{report.id}</span>
                            <span className="text-[11px] font-medium text-slate-500" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{report.time}</span>
                          </div>
                          <div className="text-[13px] font-semibold text-slate-900 mb-1 leading-tight" style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{report.patient}</div>
                          <div className="text-[12px] font-medium text-slate-500 mb-3" style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', marginBottom: '12px' }}>{report.test}</div>
                          
                          {status === 'Ready' && (
                            <button 
                              onClick={() => alert(`Verifying and publishing report ${report.id} for ${report.patient}...`)}
                              className="w-full mt-2 py-1.5 text-[12px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors text-center border border-emerald-200"
                              style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', width: '100%', padding: '8px 0', marginTop: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, transition: 'all 0.2s' }}
                            >
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


