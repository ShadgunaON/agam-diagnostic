'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { Inquiry } from '@/services/InquiryService';
import { inquiryService } from '@/services';

// ─────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────
function InquiryStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    New:      { bg: 'bg-blue-50 border border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-500' },
    Read:     { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700',  dot: 'bg-amber-400' },
    Resolved: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  };
  const s = map[status] ?? { bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold ${s.bg} ${s.text}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────
// Detail Page
// ─────────────────────────────────────────────────────
export default function InquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadInquiry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await inquiryService.getInquiryById(id);
      if (result.isSuccess) setInquiry(result.value);
      else setError(result.error.message || 'Inquiry not found');
    } catch (e: any) {
      setError(e.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setMounted(true);
    loadInquiry();
  }, [loadInquiry]);

  const handleStatusChange = async (newStatus: string) => {
    if (!inquiry || inquiry.status === newStatus) return;
    setUpdating(true);
    const result = await inquiryService.updateInquiryStatus(inquiry.id, newStatus);
    if (result.isSuccess) {
      setInquiry(prev => prev ? { ...prev, status: newStatus as any } : prev);
      setSuccessMsg(`Status updated to "${newStatus}"`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      alert(result.error.message || 'Failed to update status');
    }
    setUpdating(false);
  };

  if (!mounted) return null;

  const fullName = inquiry ? `${inquiry.firstName} ${inquiry.lastName}`.trim() || inquiry.email : '—';
  const initials = fullName.split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2) || '?';

  const STATUSES = ['New', 'Read', 'Resolved'];

  return (
    <AdminPageTemplate
      title="Contact Inquiry"
      description="Full message detail and status management."
      headerActions={
        <Link
          href="/admin/newsletter"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition-colors shadow-sm"
        >
          <AdminIcon name="chevronLeft" className="w-4 h-4" />
          Back to Engagement
        </Link>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center gap-4 py-24 text-slate-400">
          <svg className="animate-spin h-8 w-8 text-purple-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-[14px] font-medium">Loading inquiry…</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-24 text-red-500">
          <AdminIcon name="alertTriangle" className="w-10 h-10" />
          <p className="text-[14px] font-semibold">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-2 px-5 py-2 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-bold hover:bg-slate-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      ) : inquiry ? (
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* Success toast */}
          {successMsg && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold shadow-sm">
              <AdminIcon name="check" className="w-4 h-4 shrink-0" />
              {successMsg}
            </div>
          )}

          {/* ── Sender card ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <h2 className="text-[14px] font-extrabold text-slate-700 uppercase tracking-wider">Sender Information</h2>
            </div>
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shrink-0 shadow-md"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}
              >
                {initials}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Full Name</div>
                  <div className="text-[15px] font-bold text-slate-900">{fullName}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email</div>
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-[14px] font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    {inquiry.email}
                  </a>
                </div>
                {inquiry.phone && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Phone</div>
                    <a
                      href={`tel:${inquiry.phone}`}
                      className="text-[14px] font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      {inquiry.phone}
                    </a>
                  </div>
                )}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Received</div>
                  <div className="text-[14px] font-semibold text-slate-700">
                    {new Date(inquiry.createdAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Message card ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
              <AdminIcon name="messageSquare" className="w-4 h-4 text-purple-500" />
              <h2 className="text-[14px] font-extrabold text-slate-700 uppercase tracking-wider">Message</h2>
            </div>
            <div className="p-6">
              <div
                className="bg-gradient-to-br from-slate-50 to-purple-50/30 border border-slate-100 rounded-xl p-5 text-[14px] leading-relaxed text-slate-700 whitespace-pre-wrap font-medium"
                style={{ minHeight: '140px' }}
              >
                {inquiry.message}
              </div>
            </div>
          </div>

          {/* ── Status management card ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <h2 className="text-[14px] font-extrabold text-slate-700 uppercase tracking-wider">Status Management</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div>
                  <div className="text-[12px] font-bold text-slate-500 mb-2">Current Status</div>
                  <InquiryStatusBadge status={inquiry.status} />
                </div>
                <div className="sm:ml-auto">
                  <div className="text-[12px] font-bold text-slate-500 mb-2">Update To</div>
                  <div className="flex gap-2 flex-wrap">
                    {STATUSES.filter(s => s !== inquiry.status).map(s => {
                      const colorMap: Record<string, string> = {
                        New: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
                        Read: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
                        Resolved: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
                      };
                      return (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          disabled={updating}
                          className={`px-5 py-2 rounded-xl text-white text-[13px] font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${colorMap[s]}`}
                        >
                          {updating ? '…' : `Mark as ${s}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick reply shortcut */}
              <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-3">
                <a
                  href={`mailto:${inquiry.email}?subject=Re: Your inquiry to AGAM Diagnostics`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[13px] font-bold transition-colors shadow-md shadow-purple-200"
                >
                  <AdminIcon name="send" className="w-4 h-4" />
                  Reply via Email
                </a>
                <span className="text-[12px] text-slate-400 font-medium">Opens your default email client</span>
              </div>
            </div>
          </div>

        </div>
      ) : null}
    </AdminPageTemplate>
  );
}
