'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { KPICard } from '@/components/admin/layout/KPICard';
import { AdminCard } from '@/components/admin/primitives/AdminCard';
import { AdminButton } from '@/components/admin/primitives/AdminButton';
import { ConfigurableDataTable, ColumnDef } from '@/components/admin/tables/DataTable';
import { StatusBadge, BadgeStatus } from '@/components/admin/feedback/StatusBadge';
import { AdminIcon, AdminIconName } from '@/components/admin/navigation/AdminIcons';

// ─── Mock Data ───

interface RecentBooking {
  id: string;
  patient: {
    name: string;
    phone: string;
  };
  date: string;
  type: string;
  status: string;
  badgeType: BadgeStatus;
  amount: number;
}

const recentBookings: RecentBooking[] = [
  { id: 'B-1029', patient: { name: 'Rahul Sharma', phone: '+91 98765 43210' }, date: 'Oct 12, 2026', type: 'Home Collection', status: 'Pending', badgeType: 'neutral', amount: 1299 },
  { id: 'B-1028', patient: { name: 'Priya Patel', phone: '+91 98765 43211' }, date: 'Oct 12, 2026', type: 'Lab Visit', status: 'Completed', badgeType: 'success', amount: 499 },
  { id: 'B-1027', patient: { name: 'Anil Kumar', phone: '+91 98765 43212' }, date: 'Oct 11, 2026', type: 'Home Collection', status: 'Processing', badgeType: 'warning', amount: 2450 },
  { id: 'B-1026', patient: { name: 'Meera Reddy', phone: '+91 98765 43213' }, date: 'Oct 11, 2026', type: 'Lab Visit', status: 'Confirmed', badgeType: 'info', amount: 899 },
  { id: 'B-1025', patient: { name: 'Suresh Menon', phone: '+91 98765 43214' }, date: 'Oct 10, 2026', type: 'Home Collection', status: 'Cancelled', badgeType: 'danger', amount: 3100 },
];

const operationalAlerts = [
  { id: '1', message: '3 reports overdue by more than 24 hours', severity: 'danger' as const, time: '2h ago', action: 'View Reports', href: '/admin/reports' },
  { id: '2', message: '5 home collections unassigned for tomorrow', severity: 'warning' as const, time: '1h ago', action: 'Assign Staff', href: '/admin/bookings' },
  { id: '3', message: '2 payments pending verification', severity: 'info' as const, time: '45m ago', action: 'Review', href: '/admin/bookings' },
];

const activityFeed = [
  { id: '1', user: 'System', action: 'New home collection booking (B-1030) received', time: 'Just now' },
  { id: '2', user: 'Dr. Sarah', action: 'Uploaded pathology report for B-1021', time: '10 mins ago' },
  { id: '3', user: 'Admin Staff', action: 'Assigned Phlebotomist to B-1029', time: '1 hour ago' },
];

const quickActions = [
  { label: 'New Booking', subtitle: 'CREATE NEW', icon: 'calendar' as AdminIconName, href: '/admin/bookings' },
  { label: 'Upload Report', subtitle: 'ADD RESULT', icon: 'file' as AdminIconName, href: '/admin/reports' },
  { label: 'Add Patient', subtitle: 'REGISTER', icon: 'users' as AdminIconName, href: '/admin/patients' },
  { label: 'View Schedule', subtitle: 'CALENDAR', icon: 'clock' as AdminIconName, href: '/admin/staff' },
];

// ─── Component ───

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Table columns for recent bookings
  const columns = useMemo<ColumnDef<RecentBooking>[]>(() => [
    {
      id: 'id',
      header: 'Booking ID',
      accessorKey: 'id',
      width: '15%',
      cellClassName: 'font-semibold font-mono text-slate-900 whitespace-nowrap text-[13px]',
    },
    {
      id: 'patient',
      header: 'Patient',
      width: '28%',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-semibold text-slate-900 leading-none">{row.patient.name}</span>
          <span className="text-[12px] text-slate-500 leading-none">{row.patient.phone}</span>
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
      width: '15%',
      cellClassName: 'text-[13px] text-slate-700 font-medium',
    },
    {
      id: 'type',
      header: 'Test Type',
      width: '18%',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-600">
          <AdminIcon
            name={row.type === 'Home Collection' ? 'mapPin' : 'testTube'}
            className="w-[14px] h-[14px] shrink-0 text-slate-400"
            strokeWidth={2}
          />
          <span className="whitespace-nowrap text-[13px] font-medium">{row.type}</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      width: '12%',
      cell: ({ row }) => (
        <StatusBadge type={row.badgeType} status={row.status} />
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      width: '12%',
      className: 'text-right',
      cellClassName: 'text-right font-semibold text-slate-900 text-[13px] tabular-nums',
      cell: ({ row }) => (
        <span className="flex items-center justify-end">
          <span className="text-slate-400 font-normal mr-0.5">₹</span>
          {row.amount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      width: 'auto',
      className: 'text-right',
      cellClassName: 'text-right',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-3">
          <button className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-[180ms]" title="View details">
            <AdminIcon name="chevronRight" className="w-[16px] h-[16px]" strokeWidth={2} />
          </button>
        </div>
      ),
    },
  ], []);

  return (
    <AdminPageTemplate
      title="Dashboard"
    >

      {/* 2. Executive KPI Cards (Moved to top) */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Today's Bookings"
            value="24"
            icon="calendar"
            trend={{ value: 12.5, isPositive: true, label: 'vs yesterday' }}
          />
          <KPICard
            title="Pending"
            value="6"
            icon="clock"
            trend={{ value: 2, isPositive: false, label: 'Needs attention' }}
          />
          <KPICard
            title="Home Collections"
            value="12"
            icon="mapPin"
            trend={{ value: 50, isPositive: true, label: 'of today' }}
          />
          <KPICard
            title="Revenue Today"
            value="₹18,450"
            icon="creditCard"
            trend={{ value: 8.2, isPositive: true, label: 'vs yesterday' }}
          />
        </div>
      </div>

      {/* 3. Quick Actions */}
      <div style={{ marginTop: '16px', marginBottom: '24px', paddingLeft: '40px', paddingRight: '40px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {quickActions.map((action, index) => {
            const colorClasses = [
              "from-blue-500 to-blue-600 shadow-blue-500/25",
              "from-indigo-500 to-indigo-600 shadow-indigo-500/25",
              "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
              "from-violet-500 to-violet-600 shadow-violet-500/25"
            ];
            const colorClass = colorClasses[index % colorClasses.length];

            return (
              <Link key={action.label} href={action.href} className="w-full group">
                <div
                  className={`w-full flex items-center justify-center gap-2 px-4 h-[40px] rounded-lg bg-gradient-to-r text-white font-semibold text-[13px] shadow-sm transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-lg ${colorClass}`}
                >
                  <AdminIcon name={action.icon} className="w-[16px] h-[16px] group-hover:scale-125 transition-transform duration-300 ease-out" strokeWidth={2.5} />
                  <span className="tracking-wide">{action.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Bookings (Sectional Layout) */}
      <div style={{ marginBottom: '40px' }}>
        <AdminCard padding="none" className="overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-xl border border-slate-200 bg-white">
          <div
            className="flex items-center justify-between py-6 pr-6 border-b border-slate-200"
            style={{ paddingLeft: '40px' }}
          >
            <div>
              <div className="text-[14px] font-bold text-slate-800 uppercase tracking-wider">Recent Bookings</div>
            </div>
            <Link
              href="/admin/bookings"
              className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
            >
              View All
              <AdminIcon name="chevronRight" className="w-[14px] h-[14px]" strokeWidth={2.5} />
            </Link>
          </div>
          <ConfigurableDataTable
            data={recentBookings}
            columns={columns}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            onRowClick={(row) => console.log('Navigate to booking', row.id)}
            className="border-none shadow-none rounded-none bg-transparent"
          />
        </AdminCard>
      </div>

      {/* 5. Alerts & Feed (Side by Side below table) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ marginBottom: '40px' }}>

        {/* Operational Alerts */}
        {operationalAlerts.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <AdminCard padding="none" className="overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 bg-white" style={{ borderRadius: '12px' }}>
              <div className="flex items-center justify-between border-b border-slate-200" style={{ padding: '20px' }}>
                <div className="text-[14px] font-bold text-slate-800 uppercase tracking-wider">Operational Alerts</div>
              </div>
              <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                {operationalAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center hover:bg-slate-50 transition-colors duration-200 group" style={{ padding: '20px', gap: '16px' }}>
                    <div
                      className={`flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105 duration-300 ${alert.severity === 'danger' ? 'bg-red-50 border-red-100 text-red-500'
                          : alert.severity === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-500'
                            : 'bg-blue-50 border-blue-100 text-blue-500'
                        }`}
                      style={{ width: '40px', height: '40px', borderRadius: '10px' }}
                    >
                      <AdminIcon
                        name={
                          alert.severity === 'danger' ? 'alertTriangle'
                            : alert.severity === 'warning' ? 'clock'
                              : 'info'
                        }
                        style={{ width: '18px', height: '18px' }}
                        strokeWidth={2.5}
                      />
                    </div>
                    <div className="flex-1 min-w-0" style={{ paddingRight: '12px' }}>
                      <p className="text-[14px] text-slate-900 font-semibold leading-snug mb-1">{alert.message}</p>
                      <span className="text-[12px] font-medium text-slate-400 flex items-center" style={{ gap: '6px' }}>
                        <AdminIcon name="clock" style={{ width: '12px', height: '12px' }} />
                        {alert.time}
                      </span>
                    </div>
                    <Link
                      href={alert.href}
                      className="shrink-0 bg-white border border-slate-200 text-[12px] font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm hover:shadow"
                      style={{ padding: '8px 14px', borderRadius: '8px' }}
                    >
                      {alert.action}
                    </Link>
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>
        )}

        {/* Activity Feed */}
        <div style={{ marginBottom: '40px' }}>
          <AdminCard padding="none" className="overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 bg-white" style={{ borderRadius: '12px' }}>
            <div className="flex items-center justify-between border-b border-slate-200" style={{ padding: '20px' }}>
              <div className="text-[14px] font-bold text-slate-800 uppercase tracking-wider">Activity Feed</div>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar" style={{ padding: '20px' }}>
              <div className="flex flex-col" style={{ gap: '20px' }}>
                {activityFeed.map((activity, index) => (
                  <div key={activity.id} className="flex items-start group" style={{ gap: '16px' }}>
                    <div
                      className="bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 duration-300"
                      style={{ width: '40px', height: '40px', borderRadius: '10px' }}
                    >
                      <AdminIcon
                        name={activity.user === 'System' ? 'server' : 'user'}
                        className="text-slate-500"
                        style={{ width: '18px', height: '18px' }}
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ paddingTop: '2px' }}>
                      <p className="text-[13px] text-slate-600 leading-snug mb-1">
                        <span className="font-bold text-slate-900" style={{ marginRight: '6px' }}>{activity.user}</span>
                        {activity.action}
                      </p>
                      <span className="text-[11px] font-medium text-slate-400 flex items-center" style={{ gap: '6px' }}>
                        <AdminIcon name="clock" style={{ width: '12px', height: '12px' }} />
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AdminCard>
        </div>

      </div>

    </AdminPageTemplate>
  );
}
