'use client';

import React, { useState, useMemo } from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminCard } from '@/components/admin/primitives/AdminCard';
import { AdminInput } from '@/components/admin/primitives/AdminInput';
import { AdminButton } from '@/components/admin/primitives/AdminButton';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { KPICard } from '@/components/admin/layout/KPICard';
import { ConfigurableDataTable, ColumnDef } from '@/components/admin/tables/DataTable';
import { mockPatients, Patient } from '@/data/admin/mockPatients';

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return mockPatients;
    return mockPatients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
    );
  }, [searchQuery]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage, itemsPerPage]);

  const kpiSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <KPICard 
        title="Total Patients" 
        value="12,458" 
        icon="users"
        trend={{ value: 4.2, isPositive: true, label: 'vs last month' }}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-500"
      />
      <KPICard 
        title="New This Month" 
        value="342" 
        icon="userPlus"
        trend={{ value: 12, isPositive: true, label: 'vs last month' }}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-500"
      />
      <KPICard 
        title="Active Bookings" 
        value="128" 
        icon="calendar"
        trend={{ value: 2, isPositive: false, label: 'needs attention' }}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-500"
      />
      <KPICard 
        title="Retention Rate" 
        value="84%" 
        icon="activity"
        trend={{ value: 1.5, isPositive: true, label: 'vs last year' }}
        iconBgColor="bg-indigo-50"
        iconColor="text-indigo-500"
      />
    </div>
  );

  const toolbar = (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3 w-full max-w-2xl">
          {/* Search */}
          <div className="w-64 shrink-0 group">
            <AdminInput
              type="text"
              placeholder="Search by ID, name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<AdminIcon name="search" className="w-[14px] h-[14px]" strokeWidth={2} />}
            />
          </div>
          
          {/* Custom Filter Dropdowns */}
          <AdminButton variant="secondary" size="sm" className="gap-1.5 text-[11px]" onClick={() => alert('Opening Gender Filter dropdown...')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <span>Any Gender</span>
            <AdminIcon name="chevronDown" className="w-3 h-3 text-slate-400" strokeWidth={2} />
          </AdminButton>

          <AdminButton variant="secondary" size="sm" className="gap-1.5 text-[11px]" onClick={() => alert('Opening Status Filter dropdown...')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <span>Any Status</span>
            <AdminIcon name="chevronDown" className="w-3 h-3 text-slate-400" strokeWidth={2} />
          </AdminButton>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <AdminButton variant="secondary" size="sm" className="gap-1.5 text-[11px]" onClick={() => alert('Opening Advanced Filters pane...')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <AdminIcon name="filter" className="w-3 h-3 text-slate-400" strokeWidth={2} />
            Filters
          </AdminButton>
          <AdminButton variant="secondary" size="sm" className="gap-1.5 text-[11px]" onClick={() => alert('Exporting patient list to CSV...')} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
            <AdminIcon name="download" className="w-3 h-3 text-slate-400" strokeWidth={2} />
            Export
          </AdminButton>
        </div>
      </div>
    </div>
  );

  const columns = useMemo<ColumnDef<Patient>[]>(() => [
    {
      id: 'id',
      header: 'Patient ID',
      accessorKey: 'id',
      cellClassName: 'font-medium text-[var(--admin-primary)] text-[13px]',
    },
    {
      id: 'patient',
      header: 'Patient',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-semibold text-slate-900 leading-none">{row.name}</span>
          <span className="text-[12px] text-slate-500 leading-none">{row.phone}</span>
        </div>
      )
    },
    {
      id: 'demographics',
      header: 'Demographics',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-slate-700 leading-none">{row.gender}, {row.age} yrs</span>
          <span className="text-[12px] text-slate-500 leading-none">Blood: {row.bloodGroup}</span>
        </div>
      )
    },
    {
      id: 'lastVisit',
      header: 'Last Visit',
      accessorKey: 'lastVisit',
      cellClassName: 'text-[13px] text-slate-700 font-medium',
    },
    {
      id: 'totalBookings',
      header: 'Total Bookings',
      cellClassName: 'text-[13px] text-slate-700 tabular-nums',
      cell: ({ row }) => <span>{row.totalBookings} visits</span>
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
          row.status === 'Active' 
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
            : 'bg-slate-100 text-slate-600 border border-slate-200/60'
        }`}>
          {row.status}
        </div>
      )
    },
    {
      id: 'actions',
      header: '',
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
      kpiSection={kpiSection}
    >
      <div style={{ marginBottom: '40px' }}>
        <AdminCard padding="none" className="overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200" style={{ padding: '24px' }}>
            {toolbar}
          </div>
          <ConfigurableDataTable
            data={paginatedData}
            columns={columns}
            keyExtractor={(row) => row.id}
            onRowClick={(row) => alert(`Routing to detailed patient profile for: ${row.name}`)}
            pagination={{
              currentPage,
              totalPages: Math.ceil(filteredPatients.length / itemsPerPage),
              totalItems: filteredPatients.length,
              itemsPerPage,
              onPageChange: setCurrentPage,
              onItemsPerPageChange: (items: number) => {
                setItemsPerPage(items);
                setCurrentPage(1);
              }
            }}
            className="border-none shadow-none rounded-none bg-transparent"
          />
        </AdminCard>
      </div>
    </AdminPageTemplate>
  );
}
