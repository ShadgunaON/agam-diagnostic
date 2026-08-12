'use client';

import React, { useState, useEffect } from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { useToast } from '@/components/admin/feedback/Toast';
import { reportsService } from '@/services';
import { ReportTaskModel } from '@/domains/reports/model';

// ─── Component ───

export default function ClinicalReportsWorkspace() {
  const [mounted, setMounted] = useState(false);
  const { success, error } = useToast();
  const [reports, setReports] = useState<ReportTaskModel[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const loadReports = async () => {
      const result = await reportsService.getAllTasks();
      if (result.isSuccess && result.value) {
        setReports(result.value);
        if (result.value.length > 0) {
          setActiveReportId(result.value[0].id);
        }
      }
    };
    loadReports();
  }, []);

  if (!mounted) return null;

  const activeReport = reports.find(r => r.id === activeReportId);
  const pendingCount = reports.filter(r => r.status === 'Awaiting Verification').length;

  const handlePublish = async (reportId: string) => {
    // Call service to update status
    const result = await reportsService.updateStatus(reportId, 'Published');
    
    if (result.isSuccess) {
      // Re-fetch from service as the source of truth
      const updated = await reportsService.getAllTasks();
      if (updated.isSuccess && updated.value) {
        setReports(updated.value);
      }
      success('Report Verified & Published', `Report ${reportId} has been digitally signed and made available to the patient.`);
      
      // Auto-select the next pending report
      const nextPending = reports.find(r => r.status === 'Awaiting Verification' && r.id !== reportId);
      if (nextPending) setActiveReportId(nextPending.id);
    } else {
      error('Verification Failed', 'Could not verify the report at this time.');
    }
  };

  return (
    <AdminPageTemplate>
      <div style={{ paddingBottom: '40px' }}>
        {/* Workspace Layout */}
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-200px)]">
          
          {/* LEFT PANE: Verification Queue */}
          <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-4">
            
            {/* Queue Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h2 className="text-[16px] font-extrabold text-slate-900 mb-2">Verification Queue</h2>
              <div className="flex flex-wrap gap-2">
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 12px', borderRadius: '99px' }}>
                  {pendingCount} Awaiting
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '99px' }}>
                  Filter
                </span>
              </div>
            </div>

            {/* Queue List */}
            <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1">
              {reports.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => setActiveReportId(report.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeReportId === report.id 
                      ? 'bg-slate-50 border-2 border-blue-500 shadow-[0_4px_12px_rgba(59,130,246,0.1)]' 
                      : 'bg-white border border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', fontFamily: 'monospace' }}>{report.id}</span>
                    {report.priority === 'STAT' && (
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#ef4444', backgroundColor: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>STAT</span>
                    )}
                  </div>
                  <h3 className="text-[14px] font-bold text-slate-900 mb-1">{report.patient.name}</h3>
                  <p className="text-[13px] font-medium text-slate-600 mb-3">{report.testType}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-slate-400">{report.time}</span>
                    {report.status === 'Published' ? (
                       <AdminIcon name="check" strokeWidth={2.5} style={{ width: '16px', height: '16px', color: '#10b981' }} />
                    ) : (
                       <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', backgroundColor: '#fffbeb', padding: '4px 8px', borderRadius: '4px' }}>Needs Review</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANE: Clinical Verification Workspace */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeReport ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col h-full overflow-hidden">
                
                {/* Header Context */}
                <div className="p-4 lg:p-8 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">{activeReport.patient.name}</h1>
                    <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>{activeReport.patient.id}</span>
                      <span style={{ width: '4px', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '50%' }} />
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>{activeReport.patient.age} yrs, {activeReport.patient.gender}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <h2 className="text-[16px] font-bold text-slate-800 mb-1">{activeReport.testType}</h2>
                    <span className="text-[13px] font-medium text-slate-500">Collected: {activeReport.time}</span>
                  </div>
                </div>

                {/* Data Grid */}
                <div className="flex-1 overflow-x-auto">
                  <div className="min-w-[600px] p-4 lg:p-8">
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 pb-4 border-b-2 border-slate-100 mb-4">
                      <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Parameter</span>
                      <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Result</span>
                      <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Unit</span>
                      <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Reference Range</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {activeReport.results.map((result, idx) => (
                        <div key={idx} className={`grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 p-4 rounded-lg border items-center ${result.isAbnormal ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
                          <span className="text-[14px] font-semibold text-slate-800">{result.parameter}</span>
                          <span className={`text-[16px] font-extrabold ${result.isAbnormal ? 'text-red-500' : 'text-slate-900'}`}>{result.value}</span>
                          <span className="text-[13px] font-medium text-slate-500">{result.unit}</span>
                          <span className="text-[13px] font-medium text-slate-400">{result.reference}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-4 lg:p-6 lg:px-8 border-t border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex gap-3 items-center">
                    <AdminIcon name="fileText" className="w-6 h-6 text-slate-500 shrink-0" strokeWidth={2} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Digital Signature Ready</div>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>Assigned to: Dr. Sarah Jenkins (Pathologist)</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button className="px-6 py-3 bg-white border border-slate-300 rounded-lg text-[14px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                      Preview PDF
                    </button>
                    {activeReport.status !== 'Published' ? (
                      <button 
                        onClick={() => handlePublish(activeReport.id)}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 border-none rounded-lg text-[14px] font-bold text-white transition-colors shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                      >
                        Digitally Sign & Publish
                      </button>
                    ) : (
                      <button disabled className="px-6 py-3 bg-slate-100 border border-slate-200 rounded-lg text-[14px] font-bold text-slate-400 cursor-not-allowed">
                        Published
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-white border border-slate-200 rounded-2xl">
                <p className="text-slate-400 font-semibold">Select a report from the queue to review.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </AdminPageTemplate>
  );
}
