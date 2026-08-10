'use client';

import React, { useState } from 'react';
import { AdminDrawer } from '../overlays/AdminDrawer';
import { Booking, BookingStatus } from '@/data/bookings';
import { StatusBadge } from '../feedback/StatusBadge';
import { Timeline } from '../feedback/Timeline';
import { AdminIcon } from '../navigation/AdminIcons';
import { AdminDropdown } from '../overlays/AdminDropdown';
import { AdminDialog, DialogFooterCancel, DialogFooterConfirm } from '../overlays/AdminDialog';
import { getStatusBadgeType } from '@/lib/admin/bookingUtils';
import { AdminButton } from '../primitives/AdminButton';

interface BookingDetailsDrawerProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelBooking?: (booking: Booking) => void;
  onStatusUpdate?: (booking: Booking, newStatus: BookingStatus) => void;
}

const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  'Pending': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Assigned', 'Cancelled'],
  'Assigned': ['Sample Collected', 'Cancelled'],
  'Sample Collected': ['Processing'],
  'Processing': ['Completed'],
  'Completed': [],
  'Cancelled': [],
};

export function BookingDetailsDrawer({ booking, isOpen, onClose, onCancelBooking, onStatusUpdate }: BookingDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'payment'>('overview');
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  if (!booking) return null;

  const availableTransitions = STATUS_TRANSITIONS[booking.status] || [];

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Booking ${booking.id}`}
      subtitle={`Created on ${booking.createdAt}`}
      width="lg"
    >
      <div className="bg-slate-50/50 flex flex-col min-h-full">

        {/* Header Profile Section */}
        <div className="p-4 sm:p-6 lg:p-8 bg-white border-b border-slate-200/80 shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:justify-between mb-6 gap-4 sm:gap-0">
            <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-xl font-bold text-slate-500">{booking.patient.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-slate-900 tracking-tight">{booking.patient.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[13px] text-slate-500 mt-1 font-medium">
                    <span>{booking.patient.gender}, {booking.patient.age} yrs</span>
                    <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{booking.patient.phone}</span>
                  </div>
              </div>
            </div>
            <StatusBadge type={getStatusBadgeType(booking.status)} status={booking.status} />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <AdminButton
              variant="primary"
              onClick={() => setShowStatusDialog(true)}
              disabled={availableTransitions.length === 0}
              className="flex-1"
            >
              Update Status
            </AdminButton>
            <AdminButton variant="secondary" className="flex-1">
              View Report
            </AdminButton>
            <AdminDropdown
              align="right"
              trigger={
                <AdminButton variant="secondary" size="icon" aria-label="More booking actions">
                  <AdminIcon name="moreVertical" className="w-[18px] h-[18px]" strokeWidth={2} />
                </AdminButton>
              }
              items={[
                { label: 'Edit Booking', icon: 'edit', onClick: () => console.log('Edit', booking.id) },
                { label: 'Reschedule', icon: 'calendar', onClick: () => console.log('Reschedule', booking.id) },
                ...(booking.status !== 'Cancelled' && booking.status !== 'Completed' ? [
                  { label: 'Cancel Booking', icon: 'x' as const, danger: true, onClick: () => onCancelBooking?.(booking) }
                ] : [])
              ]}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-white shrink-0 overflow-x-auto">
          <nav className="flex space-x-6 sm:space-x-8 -mb-px min-w-max">
            {(['overview', 'timeline', 'payment'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-[13px] font-semibold border-b-[3px] transition-colors capitalize ${activeTab === tab
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Collection Details */}
              <div className="bg-white rounded-lg border border-slate-200/80 p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Collection Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                  <div>
                    <p className="text-[12px] text-slate-500 mb-1 font-medium">Type</p>
                    <p className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                      <AdminIcon name={booking.collection.type === 'Home Collection' ? 'mapPin' : 'testTube'} className="w-3.5 h-3.5 text-slate-400" strokeWidth={2.5} />
                      {booking.collection.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-500 mb-1 font-medium">Date & Time</p>
                    <p className="text-[13px] font-semibold text-slate-900">{booking.collection.date}, {booking.collection.timeSlot}</p>
                  </div>
                  {booking.collection.address && (
                    <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                      <p className="text-[12px] text-slate-500 mb-1 font-medium">Collection Address</p>
                      <p className="text-[13px] font-medium text-slate-900 leading-relaxed">{booking.collection.address}</p>
                    </div>
                  )}
                  {booking.collection.assignedPhlebotomist && (
                    <div className="sm:col-span-2 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[12px] text-slate-500 mb-1 font-medium">Assigned To</p>
                        <p className="text-[13px] font-semibold text-slate-900">{booking.collection.assignedPhlebotomist}</p>
                      </div>
                      <button className="text-[12px] text-slate-500 font-semibold hover:text-slate-900 transition-colors">Reassign</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tests & Packages */}
              <div className="bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                <div className="p-4 border-b border-slate-200/80 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requested Tests</h4>
                </div>
                <ul className="divide-y divide-slate-100">
                  {booking.items.map((item: any, idx: number) => (
                    <li key={idx} className="p-4 flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <AdminIcon name={item.type === 'Package' ? 'package' : 'testTube'} className="w-[18px] h-[18px] text-slate-400" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-900">{item.name}</p>
                          <p className="text-[12px] text-slate-500 font-medium">{item.type}</p>
                        </div>
                      </div>
                      <p className="text-[13px] font-semibold text-slate-900 tabular-nums">₹{item.price}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="bg-white rounded-lg border border-slate-200/80 p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <h4 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">Workflow Activity</h4>
              <Timeline events={booking.timeline} />
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="bg-white rounded-lg border border-slate-200/80 p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 sm:gap-0">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Summary</h4>
                <StatusBadge
                  type={booking.payment.status === 'Paid' ? 'success' : booking.payment.status === 'Failed' ? 'danger' : 'warning'}
                  status={booking.payment.status}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="text-slate-900 font-semibold tabular-nums">₹{booking.payment.total}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-500 font-medium">Taxes</span>
                  <span className="text-slate-900 font-semibold tabular-nums">₹0</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-500 font-medium">Discount</span>
                  <span className="text-emerald-600 font-semibold tabular-nums">-₹0</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <span className="font-bold text-slate-900 text-[14px]">Total Amount</span>
                  <span className="font-bold text-[18px] text-slate-900 tabular-nums leading-none">₹{booking.payment.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-md border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <AdminIcon name="creditCard" className="w-4 h-4 text-slate-500" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900">Payment Method</p>
                    <p className="text-[12px] text-slate-500 font-medium">{booking.payment.method}</p>
                  </div>
                </div>
                {booking.payment.status === 'Paid' && (
                  <button className="text-[12px] font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                    Download Receipt
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Dialog */}
      <AdminDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        title="Update Booking Status"
        description={`Select the next status for booking ${booking.id}`}
        size="sm"
        footer={
          <DialogFooterCancel onClose={() => setShowStatusDialog(false)} />
        }
      >
        <div className="flex flex-col gap-2">
          {availableTransitions.map((status) => (
            <button
              key={status}
              onClick={() => {
                onStatusUpdate?.(booking, status);
                setShowStatusDialog(false);
              }}
              className="flex items-center gap-3 w-full p-3 rounded-md border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-left"
            >
              <StatusBadge type={getStatusBadgeType(status)} status={status} />
              <span className="text-[13px] text-slate-500 ml-auto">→</span>
            </button>
          ))}
          {availableTransitions.length === 0 && (
            <p className="text-[13px] text-slate-500 text-center py-4">This booking has reached its final status.</p>
          )}
        </div>
      </AdminDialog>
    </AdminDrawer>
  );
}
