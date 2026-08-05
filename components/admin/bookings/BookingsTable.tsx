'use client';

import React, { useMemo } from 'react';
import { ConfigurableDataTable, ColumnDef, ConfigurableDataTableProps } from '../tables/DataTable';
import { Booking } from '@/data/admin/mockBookings';
import { StatusBadge } from '../feedback/StatusBadge';
import { AdminDropdown } from '../overlays/AdminDropdown';
import { AdminIcon } from '../navigation/AdminIcons';
import { getStatusBadgeType } from '@/lib/admin/bookingUtils';

interface BookingsTableProps {
  data: Booking[];
  isLoading?: boolean;
  onRowClick: (booking: Booking) => void;
  onCancelBooking?: (booking: Booking) => void;
  pagination?: ConfigurableDataTableProps<Booking>['pagination'];
  className?: string;
}



export function BookingsTable({ data, isLoading, onRowClick, onCancelBooking, pagination, className }: BookingsTableProps) {

  const columns = useMemo<ColumnDef<Booking>[]>(() => [
    {
      id: 'id',
      header: 'Booking ID',
      accessorKey: 'id',
      cellClassName: 'font-medium text-[var(--admin-primary)] text-[13px]',
    },
    {
      id: 'patient',
      header: 'Patient',
      cell: ({ row }) => (
        <div className="relative group/patient">
          <div className="font-semibold text-slate-900 text-[13px] tracking-tight flex items-center gap-1.5">
            {row.patient.name}
            <button
              className="opacity-0 group-hover/patient:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(row.patient.name);
              }}
              title="Copy name"
            >
              <AdminIcon name="copy" className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </div>
          <div className="text-[12px] text-slate-500 mt-0.5 flex items-center gap-1.5">
            {row.patient.phone}
            <button
              className="opacity-0 group-hover/patient:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(row.patient.phone);
              }}
              title="Copy phone"
            >
              <AdminIcon name="copy" className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'date',
      header: 'Date & Time',
      cell: ({ row }) => (
        <div>
          <div className="text-[13px] font-medium text-slate-900 whitespace-nowrap">{row.collection.date}</div>
          <div className="text-[12px] text-slate-500 mt-0.5 whitespace-nowrap">{row.collection.timeSlot}</div>
        </div>
      )
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-600">
          <AdminIcon
            name={row.collection.type === 'Home Collection' ? 'mapPin' : 'testTube'}
            className="w-[14px] h-[14px] shrink-0 text-slate-400"
            strokeWidth={2}
          />
          <span className="whitespace-nowrap text-[13px] font-medium">{row.collection.type}</span>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge
          type={getStatusBadgeType(row.status)}
          status={row.status}
        />
      )
    },
    {
      id: 'payment',
      header: 'Amount',
      cellClassName: 'text-right font-semibold text-slate-900 text-[13px] tabular-nums',
      cell: ({ row }) => (
        <span className="flex items-center justify-end">
          <span className="text-slate-400 font-normal mr-0.5">₹</span>
          {row.payment.total.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      id: 'actions',
      header: '',
      cellClassName: 'w-32 text-right',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            onClick={(e) => e.stopPropagation()}
            title="Edit Booking"
            aria-label={`Edit booking ${row.id}`}
          >
            <AdminIcon name="edit" className="w-[16px] h-[16px]" strokeWidth={2} />
          </button>
          <button
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            onClick={(e) => e.stopPropagation()}
            title="Message Patient"
            aria-label={`Message ${row.patient.name}`}
          >
            <AdminIcon name="messageSquare" className="w-[16px] h-[16px]" strokeWidth={2} />
          </button>
          <AdminDropdown
            align="right"
            trigger={
              <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" onClick={(e) => e.stopPropagation()} aria-label={`More actions for ${row.id}`}>
                <AdminIcon name="moreVertical" className="w-[18px] h-[18px]" strokeWidth={2} />
              </button>
            }
            items={[
              { label: 'View Details', icon: 'eye', onClick: () => onRowClick(row) },
              { label: 'Edit Booking', icon: 'edit', onClick: () => console.log('Edit', row.id) },
              { label: 'Cancel Booking', icon: 'x', danger: true, onClick: () => onCancelBooking?.(row) }
            ]}
          />
        </div>
      )
    }
  ], [onRowClick]);

  return (
    <ConfigurableDataTable
      data={data}
      columns={columns}
      keyExtractor={(row) => row.id}
      onRowClick={onRowClick}
      isLoading={isLoading}
      pagination={pagination}
      className={className}
    />
  );
}
