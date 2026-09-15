'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { NewsletterSubscriber } from '@/domains/blog/model';
import { Inquiry } from '@/services/InquiryService';
import { blogService } from '@/services';
import { inquiryService } from '@/services';

// ─────────────────────────────────────────────────────
// Status badge helper
// ─────────────────────────────────────────────────────
function InquiryStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    New: { bg: 'bg-blue-50 border border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
    Read: { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
    Resolved: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  };
  const s = map[status] ?? { bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────
// Subscriber status badge
// ─────────────────────────────────────────────────────
function SubscriberStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
      status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
    }`}>
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────
// Spinner
// ─────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────
// Section header
// ─────────────────────────────────────────────────────
function SectionHeader({ title, description, right }: { title: string; description: string; right?: React.ReactNode }) {
  return (
    <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/60">
      <div>
        <h2 className="text-[16px] font-extrabold text-slate-900 m-0">{title}</h2>
        <p className="text-[12px] font-medium text-slate-500 mt-0.5">{description}</p>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Avatar initials
// ─────────────────────────────────────────────────────
function Avatar({ name, color = '#3b82f6' }: { name: string; color?: string }) {
  const initials = name.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2) || '?';
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────
function EmptyState({ icon, message }: { icon: any; message: string }) {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
        <AdminIcon name={icon} className="w-7 h-7 text-slate-300" />
      </div>
      <p className="text-[13px] font-medium">{message}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────
export default function AdminEngagementPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscribers' | 'inquiries'>('subscribers');

  // ── Newsletter state ──
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [subSearch, setSubSearch] = useState('');
  const [subLoading, setSubLoading] = useState(true);
  const [subError, setSubError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // ── Inquiries state ──
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inqSearch, setInqSearch] = useState('');
  const [inqStatusFilter, setInqStatusFilter] = useState<string>('All');
  const [inqLoading, setInqLoading] = useState(true);
  const [inqError, setInqError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // ── Newsletter loaders ──
  const loadSubscribers = useCallback(async () => {
    setSubLoading(true);
    setSubError(null);
    try {
      const result = await blogService.getNewsletterSubscribers();
      if (result.isSuccess) setSubscribers(result.value);
      else setSubError(result.error.message || 'Failed to load subscribers');
    } catch (e: any) {
      setSubError(e.message || 'Unexpected error');
    } finally {
      setSubLoading(false);
    }
  }, []);

  // ── Inquiry loaders ──
  const loadInquiries = useCallback(async () => {
    setInqLoading(true);
    setInqError(null);
    try {
      const result = await inquiryService.getAdminInquiries({ limit: 100 });
      if (result.isSuccess) setInquiries(result.value.items);
      else setInqError(result.error.message || 'Failed to load inquiries');
    } catch (e: any) {
      setInqError(e.message || 'Unexpected error');
    } finally {
      setInqLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadSubscribers();
    loadInquiries();
  }, [loadSubscribers, loadInquiries]);

  // ── Newsletter actions ──
  const handleUnsubscribe = async (email: string) => {
    if (!confirm('Unsubscribe this email?')) return;
    const result = await blogService.unsubscribeNewsletter(email);
    if (result.isSuccess) setSubscribers(prev => prev.map(s => s.email === email ? { ...s, status: 'Unsubscribed' } : s));
    else alert(result.error.message || 'Failed to unsubscribe');
  };

  const handleDeleteSub = async (email: string) => {
    if (!confirm('Permanently delete this subscriber?')) return;
    const result = await blogService.deleteNewsletterSubscriber(email);
    if (result.isSuccess) setSubscribers(prev => prev.filter(s => s.email !== email));
    else alert(result.error.message || 'Failed to delete');
  };

  // ── Inquiry actions ──
  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const result = await inquiryService.updateInquiryStatus(id, status);
    if (result.isSuccess) {
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: status as any } : i));
    } else {
      alert(result.error.message || 'Failed to update status');
    }
    setUpdatingId(null);
  };

  if (!mounted) return null;

  // ── Filtered data ──
  const filteredSubs = subscribers.filter(s => s.email.toLowerCase().includes(subSearch.toLowerCase()));
  const filteredInquiries = inquiries.filter(i => {
    const matchesSearch = inqSearch
      ? (`${i.firstName} ${i.lastName} ${i.email} ${i.message}`).toLowerCase().includes(inqSearch.toLowerCase())
      : true;
    const matchesStatus = inqStatusFilter !== 'All' ? i.status === inqStatusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // ── KPI stats ──
  const totalSubs = subscribers.length;
  const activeSubs = subscribers.filter(s => s.status === 'Active').length;
  const totalInq = inquiries.length;
  const newInq = inquiries.filter(i => i.status === 'New').length;
  const resolvedInq = inquiries.filter(i => i.status === 'Resolved').length;

  const STATUS_TABS = ['All', 'New', 'Read', 'Resolved'];
  const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <AdminPageTemplate
      title="Engagement"
      description="Manage newsletter subscribers and contact form inquiries from your audience."
    >
      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Subscribers', value: totalSubs, icon: 'mail' as const, color: '#3b82f6' },
          { label: 'Active Subscribers', value: activeSubs, icon: 'check' as const, color: '#10b981' },
          { label: 'Total Inquiries', value: totalInq, icon: 'messageSquare' as const, color: '#8b5cf6' },
          { label: 'New Inquiries', value: newInq, icon: 'bell' as const, color: '#f59e0b' },
          { label: 'Resolved', value: resolvedInq, icon: 'check' as const, color: '#06b6d4' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${stat.color}18`, color: stat.color }}
            >
              <AdminIcon name={stat.icon} className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 leading-tight">{stat.value}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5 leading-tight">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-6 py-3 text-[14px] font-bold border-b-2 transition-colors ${
            activeTab === 'subscribers'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Newsletter Subscribers
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-6 py-3 text-[14px] font-bold border-b-2 transition-colors ${
            activeTab === 'inquiries'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Contact Inquiries
        </button>
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 1 — Newsletter Subscribers
      ══════════════════════════════════════════════ */}
      {activeTab === 'subscribers' && (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <SectionHeader
          title="Newsletter Subscribers"
          description="Users subscribed to receive blog insights and updates."
          right={
            <div className="relative w-full sm:w-[260px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AdminIcon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={subSearch}
                onChange={e => setSubSearch(e.target.value)}
                placeholder="Search by email…"
                className="w-full h-9 pl-9 pr-4 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          }
        />

        {subLoading ? (
          <div className="py-14 flex flex-col items-center gap-3 text-slate-400">
            <Spinner />
            <span className="text-[13px] font-medium">Loading subscribers…</span>
          </div>
        ) : subError ? (
          <div className="py-12 flex flex-col items-center gap-2 text-red-500">
            <AdminIcon name="alertTriangle" className="w-6 h-6" />
            <span className="text-[13px] font-medium">{subError}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subscriber</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subscribed</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map((sub) => (
                  <tr key={sub.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {sub.email[0].toUpperCase()}
                        </div>
                        <span className="text-[13px] font-semibold text-slate-800">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <SubscriberStatusBadge status={sub.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-medium text-slate-500">
                        {new Date(sub.subscribedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === sub.id ? null : sub.id); }}
                        className="text-slate-400 hover:text-blue-500 transition-colors p-1.5 rounded-lg hover:bg-blue-50"
                      >
                        <AdminIcon name="moreVertical" className="w-4 h-4" />
                      </button>
                      {openMenuId === sub.id && (
                        <div className="absolute right-6 top-11 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => { setOpenMenuId(null); navigator.clipboard.writeText(sub.email); }}
                            className="w-full text-left px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                          >
                            <AdminIcon name="copy" className="w-3.5 h-3.5" /> Copy Email
                          </button>
                          {sub.status !== 'Unsubscribed' && (
                            <button
                              onClick={() => { setOpenMenuId(null); handleUnsubscribe(sub.email); }}
                              className="w-full text-left px-4 py-2 text-[12px] font-semibold text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-2"
                            >
                              <AdminIcon name="x" className="w-3.5 h-3.5" /> Unsubscribe
                            </button>
                          )}
                          <button
                            onClick={() => { setOpenMenuId(null); handleDeleteSub(sub.email); }}
                            className="w-full text-left px-4 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <AdminIcon name="trash" className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredSubs.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState icon="mail" message="No subscribers match your search." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* ══════════════════════════════════════════════
          SECTION 2 — Contact Inquiries
      ══════════════════════════════════════════════ */}
      {activeTab === 'inquiries' && (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <SectionHeader
          title="Contact Inquiries"
          description="Messages submitted via the public contact form."
          right={
            <div className="relative w-full sm:w-[260px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AdminIcon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={inqSearch}
                onChange={e => setInqSearch(e.target.value)}
                placeholder="Search inquiries…"
                className="w-full h-9 pl-9 pr-4 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>
          }
        />

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-100 overflow-x-auto">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setInqStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${
                inqStatusFilter === tab
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-200'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab}
              {tab !== 'All' && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  inqStatusFilter === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {inquiries.filter(i => i.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {inqLoading ? (
          <div className="py-14 flex flex-col items-center gap-3 text-slate-400">
            <Spinner />
            <span className="text-[13px] font-medium">Loading inquiries…</span>
          </div>
        ) : inqError ? (
          <div className="py-12 flex flex-col items-center gap-2 text-red-500">
            <AdminIcon name="alertTriangle" className="w-6 h-6" />
            <span className="text-[13px] font-medium">{inqError}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sender</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Message Preview</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Received</th>
                  <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inq, idx) => {
                  const fullName = `${inq.firstName} ${inq.lastName}`.trim() || inq.email;
                  const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <tr key={inq.id} className="border-b border-slate-50 hover:bg-purple-50/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={fullName} color={avatarColor} />
                          <div>
                            <div className="text-[13px] font-bold text-slate-800 leading-tight">{fullName}</div>
                            <div className="text-[11px] font-medium text-slate-500 mt-0.5">{inq.email}</div>
                            {inq.phone && (
                              <div className="text-[11px] font-medium text-slate-400 mt-0.5">{inq.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[280px]">
                        <p className="text-[12px] text-slate-600 line-clamp-2 leading-relaxed">
                          {inq.message}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <InquiryStatusBadge status={inq.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[12px] font-medium text-slate-500">
                          {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick status cycle buttons */}
                          {inq.status === 'New' && (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq.id, 'Read')}
                              disabled={updatingId === inq.id}
                              title="Mark as Read"
                              className="text-amber-500 hover:text-amber-600 p-1.5 rounded-lg hover:bg-amber-50 transition-all disabled:opacity-50"
                            >
                              <AdminIcon name="eye" className="w-4 h-4" />
                            </button>
                          )}
                          {inq.status !== 'Resolved' && (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq.id, 'Resolved')}
                              disabled={updatingId === inq.id}
                              title="Mark as Resolved"
                              className="text-emerald-500 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-50 transition-all disabled:opacity-50"
                            >
                              <AdminIcon name="check" className="w-4 h-4" />
                            </button>
                          )}
                          {/* View full message */}
                          <Link
                            href={`/admin/newsletter/inquiry/${inq.id}`}
                            className="text-slate-400 hover:text-purple-600 p-1.5 rounded-lg hover:bg-purple-50 transition-all"
                            title="View full message"
                          >
                            <AdminIcon name="chevronRight" className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredInquiries.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState icon="messageSquare" message="No inquiries match your filters." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
    </AdminPageTemplate>
  );
}
