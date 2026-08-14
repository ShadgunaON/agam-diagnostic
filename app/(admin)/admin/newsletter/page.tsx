'use client';

import React, { useState, useEffect } from 'react';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { NewsletterSubscriber } from '@/domains/blog/model';

// Mock some realistic data for the admin UI demonstration
const MOCK_SUBSCRIBERS: NewsletterSubscriber[] = [
  { id: '1', email: 'johndoe@example.com', subscribedAt: 'Aug 10, 2026', status: 'Active' },
  { id: '2', email: 'sarah.williams@company.net', subscribedAt: 'Aug 11, 2026', status: 'Active' },
  { id: '3', email: 'michael_chen@startup.io', subscribedAt: 'Aug 12, 2026', status: 'Active' },
  { id: '4', email: 'emily.davis@healthcare.org', subscribedAt: 'Aug 13, 2026', status: 'Unsubscribed' },
  { id: '5', email: 'robert_johnson@email.com', subscribedAt: 'Aug 14, 2026', status: 'Active' },
];

export default function AdminNewsletterPage() {
  const [mounted, setMounted] = useState(false);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setMounted(true);
    // In a real implementation, we would fetch from blogService.getNewsletterSubscribers()
    // For now, we simulate an API call using the mock data.
    setTimeout(() => {
      setSubscribers(MOCK_SUBSCRIBERS);
    }, 400);
  }, []);

  if (!mounted) return null;

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminPageTemplate>
      <div 
        className="admin-page-container w-full max-w-[1600px] mx-auto p-4 lg:p-10 lg:py-8 flex flex-col gap-4 lg:gap-8 min-h-full"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 lg:px-8 lg:py-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 m-0 tracking-tight">Newsletter Subscribers</h1>
            <p className="text-[14px] sm:text-[15px] font-medium text-slate-500 mt-1">Manage and view users subscribed to your blog insights.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              className="w-full sm:w-auto h-[44px] px-6 rounded-xl border border-slate-200 bg-white text-slate-700 text-[14px] font-bold flex items-center justify-center sm:justify-start gap-2 cursor-pointer shadow-sm transition-colors hover:bg-slate-50"
            >
              <AdminIcon name="download" className="w-[18px] h-[18px]" />
              Export CSV
            </button>
          </div>
        </div>

        {/* DASHBOARD STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {[
            { label: 'Total Subscribers', value: subscribers.length.toString(), icon: 'users', color: '#3b82f6' },
            { label: 'Active Subscribers', value: subscribers.filter(s => s.status === 'Active').length.toString(), icon: 'check', color: '#10b981' },
            { label: 'Unsubscribed', value: subscribers.filter(s => s.status === 'Unsubscribed').length.toString(), icon: 'x', color: '#ef4444' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-6 flex items-center gap-4 shadow-sm">
              <div className="w-[48px] h-[48px] rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <AdminIcon name={stat.icon as any} className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 leading-tight">{stat.value}</div>
                <div className="text-[13px] font-semibold text-slate-500 mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* SUBSCRIBERS TABLE */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
            <h3 className="text-xl font-extrabold text-slate-900 m-0">Subscriber List</h3>
            <div className="relative w-full sm:w-[300px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AdminIcon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by email..." 
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Subscribed Date</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                          {subscriber.email[0].toUpperCase()}
                        </div>
                        <span className="text-[14px] font-semibold text-slate-800">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        subscriber.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-medium text-slate-500">{subscriber.subscribedAt}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-blue-500 transition-colors p-1 rounded hover:bg-blue-50">
                        <AdminIcon name="moreVertical" className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredSubscribers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-[14px] font-medium">
                      No subscribers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
