import React, { useEffect } from 'react';
import { ReportTaskModel } from '@/domains/reports/model';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons'; // Reusing for icons

interface ReportPreviewModalProps {
  report: ReportTaskModel;
  onClose: () => void;
}

export function ReportPreviewModal({ report, onClose }: ReportPreviewModalProps) {
  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:p-0 print:bg-white print:block">
      {/* Hide the rest of the app when printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body > *:not(#report-modal-root) {
            display: none !important;
          }
          #report-modal-root {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
          }
        }
      `}} />
      
      <div id="report-modal-root" className="bg-slate-100 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden print:w-full print:h-auto print:rounded-none print:shadow-none print:bg-white">
        
        {/* Header - Not printed */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center print:hidden shrink-0">
          <div>
            <h2 className="text-lg font-bold">Report Preview</h2>
            <p className="text-sm text-slate-400">PDF Document Simulation</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors"
            >
              <AdminIcon name="download" className="w-4 h-4" /> Save as PDF
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white"
            >
              <AdminIcon name="x" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center print:overflow-visible print:p-0">
          
          {/* A4 Paper Simulation */}
          <div 
            id="printable-report"
            className="bg-white w-full max-w-[794px] min-h-[1123px] shadow-md p-8 sm:p-12 relative print:shadow-none print:w-full print:max-w-none print:min-h-0 print:p-0"
            style={{ fontFamily: 'sans-serif' }}
          >
            {/* Report Header */}
            <div className="flex justify-between items-start border-b-2 border-blue-900 pb-6 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight m-0">AGAM DIAGNOSTICS</h1>
                <p className="text-sm text-slate-500 font-medium mt-1">Advanced Clinical Laboratory</p>
                <div className="mt-4 text-xs text-slate-500 space-y-1">
                  <p>123 Medical Innovation Way</p>
                  <p>Tech City, TC 10020</p>
                  <p>Ph: +1 (555) 123-4567</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-800">LABORATORY REPORT</div>
                <div className="mt-4 flex flex-col items-end gap-1 text-sm">
                  <div className="bg-slate-100 px-3 py-1 rounded text-slate-700">
                    <span className="font-bold">Report ID:</span> {report.id}
                  </div>
                  <div className="bg-slate-100 px-3 py-1 rounded text-slate-700">
                    <span className="font-bold">Date:</span> {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-6 rounded-lg border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Patient Information</p>
                <p className="text-lg font-bold text-slate-800">{report.patient.name}</p>
                <p className="text-sm text-slate-600 mt-1">
                  {report.patient.age} Yrs / {report.patient.gender}
                </p>
                <p className="text-sm text-slate-600 mt-1">ID: {report.patient.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Test Details</p>
                <p className="text-sm text-slate-800 font-bold">{report.testType}</p>
                <p className="text-sm text-slate-600 mt-1">Priority: <span className="font-medium text-amber-600">{report.priority}</span></p>
                <p className="text-sm text-slate-600 mt-1">Time: {report.time}</p>
              </div>
            </div>

            {/* Results Table */}
            <div className="mb-12">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Investigation Results</h3>
              
              {report.results && report.results.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="py-3 px-2 text-slate-500 font-bold w-2/5">PARAMETER</th>
                      <th className="py-3 px-2 text-slate-500 font-bold w-1/5">RESULT</th>
                      <th className="py-3 px-2 text-slate-500 font-bold w-1/5">UNIT</th>
                      <th className="py-3 px-2 text-slate-500 font-bold w-1/5">REFERENCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.results.map((res, idx) => {
                      return (
                        <tr key={idx} className="border-b border-slate-100 last:border-0">
                          <td className="py-4 px-2 font-medium text-slate-800">{res.parameter}</td>
                          <td className="py-4 px-2">
                            <span className={`font-bold ${res.isAbnormal ? 'text-red-600' : 'text-slate-800'}`}>
                              {res.value} {res.isAbnormal && '*'}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-slate-600">{res.unit}</td>
                          <td className="py-4 px-2 text-slate-600">
                            {res.reference || 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-slate-500 bg-slate-50 rounded border border-dashed border-slate-200">
                  <p className="font-medium">No results recorded yet.</p>
                  <p className="text-xs mt-1">Results will appear here once processing is completed.</p>
                </div>
              )}
            </div>

            {/* Footer / Signatures */}
            <div className="absolute bottom-12 left-12 right-12 pt-8 border-t border-slate-200 flex justify-between items-end">
              <div>
                <p className="text-xs text-slate-400">Generated electronically by Agam Diagnostics System</p>
                <p className="text-xs text-slate-400 mt-1">Status: <span className="font-bold text-slate-600">{report.status}</span></p>
              </div>
              <div className="text-center">
                {report.status === 'Published' ? (
                  <>
                    <div className="w-32 h-12 border-2 border-blue-900/20 text-blue-900/40 rounded flex items-center justify-center font-bold text-xl italic mb-2 transform -rotate-2">
                      e-SIGNED
                    </div>
                    <p className="text-sm font-bold text-slate-800">Dr. Sarah Jenkins</p>
                    <p className="text-xs text-slate-500">Chief Pathologist</p>
                  </>
                ) : (
                  <div className="text-sm font-bold text-slate-400 italic py-4">
                    [ Pending Digital Signature ]
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
