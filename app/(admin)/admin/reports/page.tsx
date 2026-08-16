'use client';

import React, { useState, useEffect } from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { useToast } from '@/components/admin/feedback/Toast';
import { reportsService, bookingService } from '@/services';
import { ReportTaskModel } from '@/domains/reports/model';
import { BookingModel } from '@/domains/booking/model';
import { useRBAC } from '@/hooks/useRBAC';
import { ReportPreviewModal } from '@/components/shared/ReportPreviewModal';

// ─── Component ───

export default function ClinicalReportsWorkspace() {
  const [mounted, setMounted] = useState(false);
  const { success, error } = useToast();
  const [reports, setReports] = useState<ReportTaskModel[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [sortKey, setSortKey] = useState('date_oldest');
  const [allBookings, setAllBookings] = useState<BookingModel[]>([]);
  const { hasPermission } = useRBAC();
  const canEditReports = hasPermission('reports', 'edit');

  useEffect(() => {
    setMounted(true);
    const loadReports = async () => {
      const [repRes, bookRes] = await Promise.all([
        reportsService.getAllTasks(),
        bookingService.getAll()
      ]);
      
      if (bookRes.isSuccess && bookRes.value) {
        setAllBookings(bookRes.value);
      }

      if (repRes.isSuccess && repRes.value) {
        setReports(repRes.value);
        if (repRes.value.length > 0) {
          setActiveReportId(repRes.value[0].id);
        }
      }
    };
    loadReports();
  }, []);

  if (!mounted) return null;

  const activeReport = reports.find(r => r.id === activeReportId);
  const pendingCount = reports.filter(r => ['Awaiting Verification', 'Processing', 'Generated'].includes(r.status)).length;

  const handleAdvanceStatus = async (reportId: string, nextStatus: ReportTaskModel['status']) => {
    const result = await reportsService.updateStatus(reportId, nextStatus);
    if (result.isSuccess) {
      const updated = await reportsService.getAllTasks();
      if (updated.isSuccess && updated.value) setReports(updated.value);
      success('Status Updated', `Report ${reportId} advanced to ${nextStatus}.`);
      
      if (nextStatus === 'Published') {
        const nextPending = reports.find(r => ['Awaiting Verification', 'Processing', 'Generated'].includes(r.status) && r.id !== reportId);
        if (nextPending) setActiveReportId(nextPending.id);
      }
    } else {
      error('Update Failed', 'Could not update the report status.');
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
              <div className="flex flex-col gap-2 mt-3">
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="date_oldest">Booking Date (Oldest First)</option>
                  <option value="date_newest">Booking Date (Newest First)</option>
                </select>
              </div>
            </div>

            {/* Queue List */}
            <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1">
              {[...reports].sort((a, b) => {
                const bkA = allBookings.find(bk => bk.id === a.bookingId);
                const bkB = allBookings.find(bk => bk.id === b.bookingId);
                const timeA = bkA ? new Date(bkA.createdAt).getTime() : 0;
                const timeB = bkB ? new Date(bkB.createdAt).getTime() : 0;
                return sortKey === 'date_newest' ? timeB - timeA : timeA - timeB;
              }).map((report) => (
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
                       <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', backgroundColor: '#fffbeb', padding: '4px 8px', borderRadius: '4px' }}>{report.status}</span>
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
                      {(() => {
                        const resultsToDisplay = activeReport.results?.length > 0 ? activeReport.results : [
                          { parameter: 'HbA1c (Glycated Hemoglobin)', value: 5.4, unit: '%', reference: '< 5.7', isAbnormal: false },
                          { parameter: 'Fasting Blood Sugar', value: 92, unit: 'mg/dL', reference: '70 - 100', isAbnormal: false },
                          { parameter: 'Total Cholesterol', value: 185, unit: 'mg/dL', reference: '< 200', isAbnormal: false }
                        ];

                        return resultsToDisplay.map((result, idx) => (
                          <div key={idx} className={`grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 p-4 rounded-lg border items-center ${result.isAbnormal ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
                            <span className="text-[14px] font-semibold text-slate-800">{result.parameter}</span>
                            <span className={`text-[16px] font-extrabold ${result.isAbnormal ? 'text-red-500' : 'text-slate-900'}`}>{result.value}</span>
                            <span className="text-[13px] font-medium text-slate-500">{result.unit}</span>
                            <span className="text-[13px] font-medium text-slate-400">{result.reference}</span>
                          </div>
                        ));
                      })()}
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
                    <button 
                      onClick={() => setShowPreviewModal(true)}
                      className="px-6 py-3 bg-white border border-slate-300 rounded-lg text-[14px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Preview PDF
                    </button>
                    {activeReport.status === 'Processing' && (
                      <button 
                        onClick={() => handleAdvanceStatus(activeReport.id, 'Generated')}
                        disabled={!canEditReports}
                        className={`px-6 py-3 border-none rounded-lg text-[14px] font-bold text-white transition-colors ${canEditReports ? 'bg-blue-500 hover:bg-blue-600' : 'bg-slate-300 cursor-not-allowed'}`}
                      >
                        Finish Processing
                      </button>
                    )}
                    {activeReport.status === 'Generated' && (
                      <button 
                        onClick={() => handleAdvanceStatus(activeReport.id, 'Awaiting Verification')}
                        disabled={!canEditReports}
                        className={`px-6 py-3 border-none rounded-lg text-[14px] font-bold text-white transition-colors ${canEditReports ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-300 cursor-not-allowed'}`}
                      >
                        Request Verification
                      </button>
                    )}
                    {activeReport.status === 'Awaiting Verification' && (
                      <button 
                        onClick={() => handleAdvanceStatus(activeReport.id, 'Published')}
                        disabled={!canEditReports}
                        className={`px-6 py-3 border-none rounded-lg text-[14px] font-bold text-white transition-colors shadow-[0_4px_12px_rgba(16,185,129,0.2)] ${canEditReports ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-300 cursor-not-allowed shadow-none'}`}
                      >
                        Digitally Sign & Publish
                      </button>
                    )}
                    {activeReport.status === 'Published' && (
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
      
      {/* MODALS */}
      {showPreviewModal && activeReport && (
        <ReportPreviewModal 
          report={{
            ...activeReport,
            results: activeReport.results?.length > 0 ? activeReport.results : [
              { parameter: 'HbA1c (Glycated Hemoglobin)', value: 5.4, unit: '%', reference: '< 5.7', isAbnormal: false },
              { parameter: 'Fasting Blood Sugar', value: 92, unit: 'mg/dL', reference: '70 - 100', isAbnormal: false },
              { parameter: 'Total Cholesterol', value: 185, unit: 'mg/dL', reference: '< 200', isAbnormal: false }
            ]
          }} 
          onClose={() => setShowPreviewModal(false)} 
        />
      )}
    </AdminPageTemplate>
  );
}
