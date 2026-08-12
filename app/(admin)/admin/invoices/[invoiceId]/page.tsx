'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { useToast } from '@/components/admin/feedback/Toast';
import { invoiceService } from '@/services';
import { InvoiceModel } from '@/domains/invoice/model';

export default function AdminInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId as string;
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceModel | null>(null);

  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      const res = await invoiceService.getById(invoiceId);
      if (res.isSuccess) {
        setInvoice(res.value);
      }
    };
    loadData();
  }, [invoiceId]);

  const handleRecordPayment = async (method: string = 'Cash') => {
    if (!invoice) return;
    // In a real app, we would get the logged-in staff ID from auth context
    const currentStaffId = 'STAFF-001'; 
    const res = await invoiceService.recordPayment(invoice.id, method, currentStaffId);
    if (res.isSuccess) {
      setInvoice(res.value);
      toast({ title: 'Payment Recorded', description: `Invoice marked as Paid via ${method}.`, variant: 'success' });
    } else {
      toast({ title: 'Payment Failed', description: res.error?.message || 'Failed to record payment', variant: 'danger' });
    }
  };

  if (!mounted || !invoice) return null;

  return (
    <AdminPageTemplate>
      <div 
        className="admin-page-container w-full max-w-[800px] mx-auto p-4 lg:p-8 xl:p-10 flex flex-col gap-6"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/invoices')}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"
          >
            <AdminIcon name="chevronLeft" className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1 flex justify-between items-center">
            <div>
              <h1 className="text-[28px] font-black text-slate-900 m-0 tracking-tight">Invoice {invoice.id}</h1>
              <p className="text-[15px] font-medium text-slate-500 m-0 mt-1">
                Generated {new Date(invoice.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              {invoice.paymentStatus === 'Paid' ? (
                <div className="flex items-center gap-2 h-10 px-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-bold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                  Paid
                </div>
              ) : (
                <button 
                  onClick={() => handleRecordPayment('Card')}
                  className="flex items-center gap-2 h-10 px-4 rounded-xl border border-blue-200 bg-blue-600 text-white hover:bg-blue-700 text-sm font-bold transition-colors shadow-sm"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  Record Payment
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 lg:p-8 border-b border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Billed To</div>
              <div className="text-[15px] font-bold text-slate-900">{invoice.patientId || 'Guest'}</div>
            </div>
            <div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Related Booking</div>
              <Link href={`/admin/bookings`} className="text-[15px] font-bold text-blue-600 hover:underline">
                {invoice.bookingId || 'N/A'}
              </Link>
            </div>
            {invoice.paymentStatus === 'Paid' && (
              <>
                <div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Payment Method</div>
                  <div className="text-[15px] font-bold text-slate-900">{invoice.paymentMethod || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Received By</div>
                  <div className="text-[15px] font-bold text-slate-900">{invoice.receivedBy || 'System'}</div>
                </div>
              </>
            )}
          </div>

          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map(item => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div className="text-[14px] font-bold text-slate-800">{item.name}</div>
                      <div className="text-[12px] font-medium text-slate-500">{item.type}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-[15px] font-black text-slate-900">₹{item.price.toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 lg:p-8 bg-slate-50 border-t border-slate-100 flex flex-col items-end gap-3">
            <div className="flex justify-between w-[240px]">
              <span className="text-[14px] font-bold text-slate-500">Subtotal</span>
              <span className="text-[14px] font-black text-slate-900">₹{invoice.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between w-[240px]">
              <span className="text-[14px] font-bold text-slate-500">Tax</span>
              <span className="text-[14px] font-black text-slate-900">₹{invoice.tax.toLocaleString()}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between w-[240px]">
                <span className="text-[14px] font-bold text-slate-500">Discount</span>
                <span className="text-[14px] font-black text-rose-600">-₹{invoice.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between w-[240px] pt-3 border-t border-slate-200 mt-1">
              <span className="text-[16px] font-black text-slate-900">Total</span>
              <span className="text-[20px] font-black text-blue-600">₹{invoice.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
