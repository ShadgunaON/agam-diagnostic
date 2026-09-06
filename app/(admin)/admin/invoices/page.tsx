'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { invoiceService } from '@/services';
import { InvoiceModel } from '@/domains/invoice/model';

export default function AdminInvoicesPage() {
  const [mounted, setMounted] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceModel[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset pagination when filters change
  useEffect(() => {
    setCursorStack([]);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentCursor = cursorStack.length > 0 ? cursorStack[cursorStack.length - 1] : null;
      const res = await invoiceService.getAdminWorkspaceGql({
        limit: 15,
        cursor: currentCursor,
        status: statusFilter,
        search: debouncedSearch
      });
      if (res.isSuccess) {
        setInvoices(res.value.data);
        setNextCursor(res.value.nextCursor);
      }
    } catch (e) {
      console.error("Failed to load invoices", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted, debouncedSearch, statusFilter, cursorStack]);

  if (!mounted) return null;

  const handleNextPage = () => {
    if (nextCursor) {
      setCursorStack(prev => [...prev, nextCursor]);
    }
  };

  const handlePrevPage = () => {
    setCursorStack(prev => prev.slice(0, -1));
  };

  return (
    <AdminPageTemplate>
      <div 
        className="admin-page-container w-full max-w-[1200px] mx-auto p-4 lg:p-8 xl:p-10 flex flex-col gap-6"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 lg:p-6 xl:p-8 rounded-[20px] border border-slate-200 shadow-sm gap-4">
          <div>
            <h1 className="text-[28px] font-black text-slate-900 m-0 tracking-tight">Ledger & Invoices</h1>
            <p className="text-[15px] font-medium text-slate-500 m-0 mt-1">Manage billing, patient invoices, and financial records.</p>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 lg:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-[320px]">
              <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Invoice ID or Patient..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-blue-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="h-11 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50 outline-none w-full sm:w-[160px]"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Invoice ID</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Patient / Booking</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 relative">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium text-sm">
                      Loading invoices...
                    </td>
                  </tr>
                )}
                {!isLoading && invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[14px] font-extrabold text-slate-900">{inv.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[13px] font-medium text-slate-500">
                        {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[14px] font-bold text-slate-700">{inv.patientId}</div>
                      <div className="text-[12px] font-medium text-slate-400">{inv.bookingId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[14px] font-black text-slate-900">₹{(inv.total || 0).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wide
                        ${inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 
                          inv.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link href={`/admin/invoices/${inv.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                         <AdminIcon name="chevronRight" className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {!isLoading && invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium text-sm">
                      No invoices found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 lg:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50 mt-auto">
            <div className="text-sm font-medium text-slate-500">
              Showing Page {cursorStack.length + 1}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={cursorStack.length === 0 || isLoading}
                className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={!nextCursor || isLoading}
                className="px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
