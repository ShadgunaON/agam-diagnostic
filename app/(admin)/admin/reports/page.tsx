'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { useToast } from '@/components/admin/feedback/Toast';
import { reportsService } from '@/services';
import { ReportTaskModel } from '@/domains/reports/model';
import { useRBAC } from '@/hooks/useRBAC';
import { ReportSubmitModal } from '@/components/admin/reports/ReportSubmitModal';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type StatusTab = 'All' | 'Pending Upload' | 'Submitted' | 'Published';

const STATUS_TABS: StatusTab[] = ['All', 'Pending Upload', 'Submitted', 'Published'];

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    'Pending Upload': { bg: '#fffbeb', color: '#d97706' },
    Submitted:       { bg: '#eff6ff', color: '#2563eb' },
    Published:       { bg: '#f0fdf4', color: '#16a34a' },
    Processing:      { bg: '#f8fafc', color: '#64748b' },
    Generated:       { bg: '#f8fafc', color: '#64748b' },
    'Awaiting Verification': { bg: '#f8fafc', color: '#64748b' },
  };
  const style = map[status] ?? { bg: '#f8fafc', color: '#64748b' };
  return (
    <span style={{
      backgroundColor: style.bg,
      color: style.color,
      fontSize: '11px',
      fontWeight: 800,
      padding: '3px 10px',
      borderRadius: '99px',
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Report Modal
// ─────────────────────────────────────────────────────────────────────────────

interface AddReportModalProps {
  onClose: () => void;
  onSuccess: (report: ReportTaskModel) => void;
}

function AddReportModal({ onClose, onSuccess }: AddReportModalProps) {
  const [bookingId, setBookingId] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const getToken = () =>
    typeof window !== 'undefined'
      ? sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || ''
      : '';

  const handleCreate = async () => {
    const id = bookingId.trim();
    if (!id) { setErr('Please enter a Booking ID.'); return; }
    setIsFetching(true);
    setErr(null);
    try {
      const token = getToken();

      // 1. Fetch booking details
      const bRes = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          query: `query BookingById($id: ID!) { bookingById(id: $id) { id patientId patient { name id } items { name } } }`,
          variables: { id },
        }),
      });
      const bJson = await bRes.json();
      if (bJson.errors?.length) throw new Error(bJson.errors[0]?.message || 'Booking not found');
      const booking = bJson.data?.bookingById;
      if (!booking) throw new Error(`Booking "${id}" not found.`);

      // 2. Check for duplicate report
      const pid = booking.patientId || booking.patient?.id;
      const exRes = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          query: `query ReportsByPatient($patientId: ID!) { reportsByPatient(patientId: $patientId) { id bookingId status } }`,
          variables: { patientId: pid },
        }),
      });
      const exJson = await exRes.json();
      const existing: any[] = exJson.data?.reportsByPatient || [];
      const dup = existing.find((r) => r.bookingId === id);

      if (dup) {
        if (dup.status === 'Pending Upload') {
          // Open the existing Pending Upload report directly — no duplicate created
          const testType = (booking.items || []).map((i: any) => i.name).join(', ') || 'Diagnostic Test';
          onSuccess({
            id: dup.id,
            bookingId: id,
            testType,
            patientId: pid || '',
            patient: { id: pid || '', name: booking.patient?.name || 'Unknown Patient' },
            status: 'Pending Upload',
          } as any);
          return;
        }
        // Already submitted or published — show informational message
        throw new Error(
          `This booking already has a report (status: ${dup.status}). Find it in the "${dup.status}" tab and use the row actions there.`
        );
      }

      // 3. No existing report — create one
      const testType = (booking.items || []).map((i: any) => i.name).join(', ') || 'Diagnostic Test';
      const result = await reportsService.createForBooking(id, pid || '', testType, booking.patient?.name || 'Unknown Patient');
      if (!result.isSuccess) throw new Error(result.error?.message || 'Failed to create report');
      onSuccess(result.value);

    } catch (e: any) {
      setErr(e?.message || 'Unexpected error.');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, backgroundColor: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={(e) => { if (e.target === e.currentTarget && !isFetching) onClose(); }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 64px rgba(0,0,0,0.16)', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>Add Report for Booking</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Enter a Booking ID to create a new report slot.</p>
          </div>
          <button onClick={onClose} disabled={isFetching} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
            <AdminIcon name="x" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Booking ID</label>
          <input
            type="text" value={bookingId} onChange={(e) => setBookingId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="e.g. bk_1234567890" disabled={isFetching} autoFocus
            style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 500, outline: 'none', boxSizing: 'border-box' }}
          />
          {err && <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>{err}</div>}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button onClick={onClose} disabled={isFetching} style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleCreate} disabled={isFetching || !bookingId.trim()} style={{ padding: '10px 24px', backgroundColor: isFetching || !bookingId.trim() ? '#cbd5e1' : '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: isFetching || !bookingId.trim() ? 'not-allowed' : 'pointer' }}>
              {isFetching ? 'Creating...' : 'Create Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const [mounted, setMounted] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();
  const { hasPermission } = useRBAC();

  const canEdit = hasPermission('reports', 'edit');
  const canCreate = hasPermission('reports', 'create');

  const [reports, setReports] = useState<ReportTaskModel[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<StatusTab>('All');
  const [sortKey, setSortKey] = useState('date_newest');
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [submitTarget, setSubmitTarget] = useState<ReportTaskModel | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const fetchReports = useCallback(async (cursor: string | null = null, navigatingBack = false) => {
    setIsLoading(true);
    const res = await reportsService.getAdminWorkspace(20, cursor, activeTab, sortKey, searchQuery);
    setIsLoading(false);
    if (res.isSuccess) {
      setReports(res.value.queue);
      setNextCursor(res.value.nextCursor);
      if (cursor && !navigatingBack) setCursorHistory(prev => [...prev, cursor]);
    } else {
      toastError('Error', res.error?.message || 'Failed to load reports');
    }
  }, [activeTab, sortKey, searchQuery]);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!mounted) return;
    setCursorHistory([]);
    fetchReports(null);
  }, [mounted, activeTab, sortKey, searchQuery]);

  if (!mounted) return null;

  const handlePublish = async (report: ReportTaskModel) => {
    if (!canEdit) return;
    setPublishingId(report.id);
    const res = await reportsService.publishReport(report.id);
    setPublishingId(null);
    if (res.isSuccess) {
      toastSuccess('Published', `Report ${report.id} is now visible to the customer.`);
      fetchReports(null);
    } else {
      toastError('Publish Failed', res.error?.message || 'Could not publish report.');
    }
  };

  const handleDownload = async (report: ReportTaskModel) => {
    if (!report.documentId) { toastError('No Document', 'No document has been uploaded for this report.'); return; }
    const res = await reportsService.getDocumentDownloadUrl(report.documentId);
    if (res.isSuccess) {
      window.open(res.value, '_blank', 'noopener,noreferrer');
    } else {
      toastError('Download Failed', res.error?.message || 'Could not retrieve download link.');
    }
  };

  const rowDate = (r: ReportTaskModel) => {
    if (r.status === 'Published' && r.publishedAt) return { label: 'Published', value: r.publishedAt };
    if (r.status === 'Submitted' && r.submittedAt) return { label: 'Submitted', value: r.submittedAt };
    return { label: 'Created', value: r.createdAt };
  };

  const effectiveStatus = (r: ReportTaskModel): 'Pending Upload' | 'Submitted' | 'Published' => {
    if (r.status === 'Submitted') return 'Submitted';
    if (r.status === 'Published') return 'Published';
    return 'Pending Upload';
  };

  return (
    <AdminPageTemplate>
      <div className="admin-page-container w-full max-w-[1440px] mx-auto p-4 lg:p-8 xl:p-10 flex flex-col gap-6 min-h-full min-w-0" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Reports</h1>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', margin: '4px 0 0 0' }}>Manage and publish diagnostic report documents.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div style={{ position: 'relative' }}>
              <AdminIcon name="search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search reports..." style={{ height: '40px', padding: '0 16px 0 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 500, outline: 'none', backgroundColor: '#fff', width: '220px' }} />
            </div>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 outline-none">
              <option value="date_newest">Newest First</option>
              <option value="date_oldest">Oldest First</option>
            </select>
            {canCreate && (
              <button onClick={() => setShowAddModal(true)} style={{ height: '40px', padding: '0 16px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AdminIcon name="plus" style={{ width: '16px', height: '16px' }} />
                Add Report
              </button>
            )}
          </div>
        </div>

        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {STATUS_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, transition: 'all 0.15s', backgroundColor: activeTab === tab ? '#0f172a' : '#f1f5f9', color: activeTab === tab ? '#ffffff' : '#475569' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div style={{ padding: '80px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>Loading reports...</div>
          ) : reports.length === 0 ? (
            <div style={{ padding: '80px 24px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <AdminIcon name="fileText" style={{ width: '24px', height: '24px', color: '#94a3b8' }} />
              </div>
              <p style={{ color: '#64748b', fontWeight: 700, fontSize: '14px', margin: '0 0 4px 0' }}>No reports found</p>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>{activeTab !== 'All' ? `No reports with status "${activeTab}".` : 'Use "Add Report" to create one.'}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    {['Booking ID', 'Patient', 'Test / Package', 'Status', 'Date', 'Actions'].map(col => (
                      <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, idx) => {
                    const eff = effectiveStatus(report);
                    const dateInfo = rowDate(report);
                    const isPublishing = publishingId === report.id;
                    return (
                      <tr key={report.id} style={{ borderBottom: idx < reports.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background-color 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>{report.bookingId || '—'}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>{report.patient?.name || '—'}</td>
                        <td style={{ padding: '14px 16px', color: '#475569', fontWeight: 500, maxWidth: '240px' }}>
                          <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{report.testType || '—'}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>{statusBadge(report.status)}</td>
                        <td style={{ padding: '14px 16px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>{dateInfo.label}</div>
                          {formatDate(dateInfo.value)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {eff === 'Pending Upload' && canCreate && (
                              <button onClick={() => setSubmitTarget(report)} style={{ padding: '6px 14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                Submit Report
                              </button>
                            )}
                            {eff === 'Submitted' && (
                              <>
                                <button onClick={() => handleDownload(report)} style={{ padding: '6px 14px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <AdminIcon name="download" style={{ width: '12px', height: '12px' }} />
                                  View
                                </button>
                                {canEdit && (
                                  <button onClick={() => handlePublish(report)} disabled={isPublishing} style={{ padding: '6px 14px', backgroundColor: isPublishing ? '#e2e8f0' : '#16a34a', color: isPublishing ? '#94a3b8' : '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: isPublishing ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                                    {isPublishing ? 'Publishing...' : 'Publish'}
                                  </button>
                                )}
                              </>
                            )}
                            {eff === 'Published' && (
                              <button onClick={() => handleDownload(report)} disabled={!report.documentId} style={{ padding: '6px 14px', backgroundColor: '#f0fdf4', color: report.documentId ? '#16a34a' : '#94a3b8', border: `1px solid ${report.documentId ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: report.documentId ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AdminIcon name="download" style={{ width: '12px', height: '12px' }} />
                                {report.documentId ? 'Download' : 'No Document'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && (cursorHistory.length > 0 || nextCursor) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0' }}>
              <button disabled={cursorHistory.length === 0} onClick={() => { const h = [...cursorHistory]; h.pop(); const pc = h.length > 0 ? h[h.length - 1] : null; setCursorHistory(h.slice(0, -1)); fetchReports(pc, true); }} className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50">← Previous</button>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Page {cursorHistory.length + 1}</span>
              <button disabled={!nextCursor} onClick={() => fetchReports(nextCursor)} className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50">Next →</button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddReportModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(newReport) => {
            setShowAddModal(false);
            toastSuccess('Report Created', `Report ${newReport.id} created. Upload a document now.`);
            setSubmitTarget(newReport);
            fetchReports(null);
          }}
        />
      )}
      {submitTarget && (
        <ReportSubmitModal
          report={submitTarget}
          onClose={() => setSubmitTarget(null)}
          onSuccess={() => { fetchReports(null); }}
        />
      )}
    </AdminPageTemplate>
  );
}
