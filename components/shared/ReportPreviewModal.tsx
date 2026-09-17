import React, { useEffect, useState } from 'react';
import { ReportTaskModel } from '@/domains/reports/model';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { reportsService } from '@/services';

interface ReportPreviewModalProps {
  report: ReportTaskModel;
  onClose: () => void;
}

/**
 * ReportPreviewModal — document-delivery viewer.
 *
 * If the report has a documentId, fetches a presigned S3 download URL and
 * opens the actual uploaded PDF in a new tab.
 * If there is no documentId, shows a clear "Document not available" state.
 *
 * No LIMS functionality: no results table, no pathologist signature,
 * no window.print(), no fabricated medical data.
 */
export function ReportPreviewModal({ report, onClose }: ReportPreviewModalProps) {
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleDownload = async () => {
    if (!report.documentId) return;
    setIsFetching(true);
    setFetchError(null);
    const res = await reportsService.getDocumentDownloadUrl(report.documentId);
    setIsFetching(false);
    if (res.isSuccess) {
      window.open(res.value, '_blank', 'noopener,noreferrer');
    } else {
      setFetchError(res.error?.message || 'Could not generate download link. Please try again.');
    }
  };

  const hasDocument = !!report.documentId;

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return iso; }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-base font-bold">Report Document</h2>
            <p className="text-xs text-slate-400 mt-0.5">{report.testType}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white" aria-label="Close">
            <AdminIcon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">

          {/* Report Metadata */}
          <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Patient</div>
              <div className="font-bold text-slate-800">{report.patient?.name || '—'}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Report ID</div>
              <div className="font-mono font-semibold text-slate-600 text-xs">{report.id}</div>
            </div>
            {report.bookingId && (
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Booking</div>
                <div className="font-mono font-semibold text-slate-600 text-xs">{report.bookingId}</div>
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Status</div>
              <div className="font-bold text-slate-800">{report.status}</div>
            </div>
            {report.publishedAt && (
              <div className="col-span-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Published</div>
                <div className="text-slate-700 font-medium">{formatDate(report.publishedAt)}</div>
              </div>
            )}
          </div>

          {/* Document Section */}
          {hasDocument ? (
            <div className="border border-slate-200 rounded-xl p-5 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <AdminIcon name="file" className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Report document is available</p>
                <p className="text-xs text-slate-500 mt-1">
                  The report PDF will open in a new tab via a secure, time-limited link.
                </p>
              </div>

              {fetchError && (
                <div className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-600">
                  {fetchError}
                </div>
              )}

              <button
                onClick={handleDownload}
                disabled={isFetching}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-bold rounded-lg transition-colors"
              >
                <AdminIcon name="download" className="w-4 h-4" />
                {isFetching ? 'Fetching link…' : 'Open / Download Report'}
              </button>

              <p className="text-xs text-slate-400">
                Download link is valid for 15 minutes after clicking.
              </p>
            </div>
          ) : (
            /* No document state — shown for legacy Published records without documentId */
            <div className="border border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <AdminIcon name="file" className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="font-bold text-slate-600 text-sm">Document not available</p>
                <p className="text-xs text-slate-400 mt-1">
                  {report.status === 'Published'
                    ? 'This report was published before document upload was introduced. No file is on record.'
                    : 'No document has been uploaded for this report yet.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
