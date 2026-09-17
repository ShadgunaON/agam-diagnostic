"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/common';
import { ReportTaskModel } from '@/domains/reports/model';
import { Button } from '@/components/ui';
import { reportsService } from '@/services';

/**
 * Customer-facing Reports page.
 *
 * Shows only Published reports from myPortal.
 * For Published reports with a documentId: "Download Report" button → real S3 PDF.
 * For Published reports without documentId: "Document not available" (disabled).
 * For non-Published reports: not shown (filtered server-side via myPortal).
 *
 * No LIMS labels, no fabricated results, no modal result table.
 */
export default function ReportsPage() {
  const { isAuthenticated, user } = useAuth();

  const [reports, setReports] = useState<ReportTaskModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchReports = async () => {
      try {
        const token = sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '';
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            query: `query MyPortalReports {
              myPortal {
                reports {
                  id
                  patientId
                  bookingId
                  status
                  createdAt
                  testType
                  documentId
                  publishedAt
                  patient { name id }
                }
              }
            }`,

          }),
        });

        const json = await response.json();
        if (json.errors) throw new Error(json.errors[0]?.message);

        if (json.data?.myPortal?.reports) {
          // Only show Published reports to customer (belt-and-suspenders — server already filters)
          const publishedReports = json.data.myPortal.reports.filter(
            (r: ReportTaskModel) => r.status === 'Published'
          );
          setReports(publishedReports);
        }
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [isAuthenticated, user]);

  const handleDownload = async (report: ReportTaskModel) => {
    if (!report.documentId) return;
    setDownloadingId(report.id);
    setDownloadError(null);
    const res = await reportsService.getDocumentDownloadUrl(report.documentId);
    setDownloadingId(null);
    if (res.isSuccess) {
      window.open(res.value, '_blank', 'noopener,noreferrer');
    } else {
      setDownloadError(res.error?.message || 'Could not get download link. Please try again.');
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return null;
    try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return iso; }
  };

  return (
    <AuthGuard>
      <div className="container" style={{ paddingTop: 'var(--sp-10)', paddingBottom: 'var(--sp-10)' }}>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-1">My Reports</h1>
          <p className="text-sm text-muted-foreground">
            {isAuthenticated
              ? 'Download your diagnostic reports once they are published by our team.'
              : 'Log in to view your reports.'}
          </p>
        </div>

        {/* Global download error */}
        {downloadError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm font-semibold text-red-600">
            {downloadError}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20 text-primary font-semibold">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-10 md:p-16 text-center shadow-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-bg-alt rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-muted-foreground/50">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No Reports Available</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
              Your diagnostic reports will appear here once they have been reviewed and published by our team.
            </p>
            <div className="flex justify-center">
              <Button href="/tests" variant="primary" size="sm">Book a Test</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const isDownloading = downloadingId === report.id;
              const isFamily = report.patientId && report.patientId !== user?.id;

              return (
                <div
                  key={report.id}
                  className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Left — Report info */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-bold bg-bg-alt text-muted-foreground px-2 py-1 rounded-md tracking-wider uppercase">
                        {report.id}
                      </span>
                      <span className="text-xs font-bold px-2 py-1 rounded-md tracking-wider uppercase bg-green-100 text-green-700">
                        Published
                      </span>
                      {isFamily && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                          Family Member
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-lg mb-1">{report.testType}</h3>

                    <p className="text-sm text-muted-foreground mb-1">
                      Patient: <strong className="text-foreground">{report.patient.name}</strong>
                    </p>

                    {report.publishedAt && (
                      <p className="text-xs text-muted-foreground">
                        Published: {formatDate(report.publishedAt)}
                      </p>
                    )}
                  </div>

                  {/* Right — Action */}
                  <div className="flex flex-col gap-2 min-w-[160px]">
                    {report.documentId ? (
                      <button
                        onClick={() => handleDownload(report)}
                        disabled={isDownloading}
                        className="w-full text-center py-2.5 px-5 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {isDownloading ? 'Fetching…' : 'Download Report'}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full text-center py-2.5 px-5 bg-bg-alt text-muted-foreground text-sm font-bold rounded-full cursor-not-allowed"
                        title="This report was published before document upload was available."
                      >
                        Document not available
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
