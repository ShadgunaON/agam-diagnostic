'use client';

import React, { useState } from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminCard } from '@/components/admin/primitives/AdminCard';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { useToast } from '@/components/admin/feedback/Toast';

// ─── Types & Mock Data ───

interface TestResult {
  parameter: string;
  value: number | string;
  unit: string;
  reference: string;
  isAbnormal: boolean;
}

interface ReportTask {
  id: string;
  patient: { name: string; age: number; gender: string; id: string };
  testType: string;
  status: 'Awaiting Verification' | 'Pending Upload' | 'Published';
  priority: 'Routine' | 'STAT';
  time: string;
  results: TestResult[];
}

const mockReports: ReportTask[] = [
  {
    id: 'REP-1045',
    patient: { name: 'Vikram Singh', age: 42, gender: 'M', id: 'PT-8892' },
    testType: 'Complete Blood Count (CBC)',
    status: 'Awaiting Verification',
    priority: 'Routine',
    time: '11:15 AM Today',
    results: [
      { parameter: 'Hemoglobin', value: 11.2, unit: 'g/dL', reference: '13.8 - 17.2', isAbnormal: true },
      { parameter: 'WBC Count', value: 7500, unit: 'cells/mcL', reference: '4,500 - 11,000', isAbnormal: false },
      { parameter: 'Platelets', value: 210000, unit: 'cells/mcL', reference: '150,000 - 450,000', isAbnormal: false },
      { parameter: 'RBC Count', value: 4.1, unit: 'million/mcL', reference: '4.7 - 6.1', isAbnormal: true },
    ]
  },
  {
    id: 'REP-1046',
    patient: { name: 'Anita Desai', age: 35, gender: 'F', id: 'PT-8893' },
    testType: 'Lipid Profile',
    status: 'Awaiting Verification',
    priority: 'Routine',
    time: '10:30 AM Today',
    results: [
      { parameter: 'Total Cholesterol', value: 240, unit: 'mg/dL', reference: '< 200', isAbnormal: true },
      { parameter: 'HDL Cholesterol', value: 45, unit: 'mg/dL', reference: '> 50', isAbnormal: true },
      { parameter: 'LDL Cholesterol', value: 160, unit: 'mg/dL', reference: '< 100', isAbnormal: true },
      { parameter: 'Triglycerides', value: 175, unit: 'mg/dL', reference: '< 150', isAbnormal: true },
    ]
  },
  {
    id: 'REP-1047',
    patient: { name: 'Suresh Menon', age: 58, gender: 'M', id: 'PT-8894' },
    testType: 'HbA1c & Fasting Glucose',
    status: 'Awaiting Verification',
    priority: 'STAT',
    time: '09:00 AM Today',
    results: [
      { parameter: 'HbA1c', value: 8.2, unit: '%', reference: '< 5.7', isAbnormal: true },
      { parameter: 'Fasting Blood Sugar', value: 145, unit: 'mg/dL', reference: '70 - 100', isAbnormal: true },
    ]
  }
];

// ─── Component ───

export default function ClinicalReportsWorkspace() {
  const { success } = useToast();
  const [reports, setReports] = useState<ReportTask[]>(mockReports);
  const [activeReportId, setActiveReportId] = useState<string>(mockReports[0].id);

  const activeReport = reports.find(r => r.id === activeReportId);
  const pendingCount = reports.filter(r => r.status === 'Awaiting Verification').length;

  const handlePublish = (reportId: string) => {
    // In production, this would sign the PDF and push to the backend
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'Published' } : r));
    success('Report Verified & Published', `Report ${reportId} has been digitally signed and made available to the patient.`);
    
    // Auto-select the next pending report
    const nextPending = reports.find(r => r.status === 'Awaiting Verification' && r.id !== reportId);
    if (nextPending) setActiveReportId(nextPending.id);
  };

  return (
    <AdminPageTemplate>
      <div style={{ paddingBottom: '40px' }}>
        {/* Workspace Layout */}
        <div style={{ display: 'flex', gap: '24px', minHeight: 'calc(100vh - 200px)' }}>
          
          {/* LEFT PANE: Verification Queue */}
          <div style={{ width: '380px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Queue Header */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Verification Queue</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 12px', borderRadius: '99px' }}>
                  {pendingCount} Awaiting
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '99px' }}>
                  Filter
                </span>
              </div>
            </div>

            {/* Queue List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
              {reports.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => setActiveReportId(report.id)}
                  style={{ 
                    backgroundColor: activeReportId === report.id ? '#f8fafc' : '#ffffff', 
                    border: activeReportId === report.id ? '2px solid #3b82f6' : '1px solid #e2e8f0', 
                    borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: activeReportId === report.id ? '0 4px 12px rgba(59, 130, 246, 0.1)' : '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', fontFamily: 'monospace' }}>{report.id}</span>
                    {report.priority === 'STAT' && (
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#ef4444', backgroundColor: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>STAT</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>{report.patient.name}</h3>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#475569', margin: '0 0 12px 0' }}>{report.testType}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>{report.time}</span>
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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {activeReport ? (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                
                {/* Header Context */}
                <div style={{ padding: '32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>{activeReport.patient.name}</h1>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>{activeReport.patient.id}</span>
                      <span style={{ width: '4px', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '50%' }} />
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>{activeReport.patient.age} yrs, {activeReport.patient.gender}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>{activeReport.testType}</h2>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Collected: {activeReport.time}</span>
                  </div>
                </div>

                {/* Data Grid */}
                <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', paddingBottom: '16px', borderBottom: '2px solid #f1f5f9', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Parameter</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Result</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Unit</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Reference Range</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeReport.results.map((result, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', padding: '16px', backgroundColor: result.isAbnormal ? '#fef2f2' : '#ffffff', borderRadius: '8px', border: result.isAbnormal ? '1px solid #fecaca' : '1px solid #f1f5f9', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{result.parameter}</span>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: result.isAbnormal ? '#ef4444' : '#0f172a' }}>{result.value}</span>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>{result.unit}</span>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>{result.reference}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Footer */}
                <div style={{ padding: '24px 32px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <AdminIcon name="fileText" style={{ width: '24px', height: '24px', color: '#64748b' }} strokeWidth={2} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Digital Signature Ready</div>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>Assigned to: Dr. Sarah Jenkins (Pathologist)</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ padding: '12px 24px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                      Preview PDF
                    </button>
                    {activeReport.status !== 'Published' ? (
                      <button 
                        onClick={() => handlePublish(activeReport.id)}
                        style={{ padding: '12px 24px', backgroundColor: '#10b981', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: '#ffffff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                      >
                        Digitally Sign & Publish
                      </button>
                    ) : (
                      <button disabled style={{ padding: '12px 24px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: '#94a3b8', cursor: 'not-allowed' }}>
                        Published
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                <p style={{ color: '#94a3b8', fontWeight: 600 }}>Select a report from the queue to review.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </AdminPageTemplate>
  );
}
