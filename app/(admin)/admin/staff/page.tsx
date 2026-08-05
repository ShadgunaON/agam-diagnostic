'use client';

import React, { useState, useMemo } from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminCard } from '@/components/admin/primitives/AdminCard';
import { AdminInput } from '@/components/admin/primitives/AdminInput';
import { AdminButton } from '@/components/admin/primitives/AdminButton';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { KPICard } from '@/components/admin/layout/KPICard';
import { ConfigurableDataTable, ColumnDef } from '@/components/admin/tables/DataTable';
import { mockStaff, StaffMember } from '@/data/admin/mockStaff';

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredStaff = useMemo(() => {
    if (!searchQuery) return mockStaff;
    return mockStaff.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(start, start + itemsPerPage);
  }, [filteredStaff, currentPage, itemsPerPage]);

  const kpiSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <KPICard 
        title="Total Staff" 
        value="142" 
        icon="users"
        trend={{ value: 2.1, isPositive: true, label: 'vs last month' }}
        variant="solid"
      />
      <KPICard 
        title="On Duty Now" 
        value="48" 
        icon="clock"
        trend={{ value: 5, isPositive: true, label: 'optimal staffing' }}
        variant="solid"
      />
      <KPICard 
        title="Field Phlebotomists" 
        value="36" 
        icon="mapPin"
        trend={{ value: 12, isPositive: true, label: 'active today' }}
        variant="solid"
      />
      <KPICard 
        title="On Leave" 
        value="8" 
        icon="calendar"
        trend={{ value: 1, isPositive: false, label: 'critical absence' }}
        variant="solid"
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
              placeholder="Search staff ID, name, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<AdminIcon name="search" className="w-[14px] h-[14px]" strokeWidth={2} />}
            />
          </div>
          
          {/* Custom Filter Dropdowns */}
          <AdminButton variant="secondary" size="sm" className="gap-1.5 text-[11px]">
            <span>Any Department</span>
            <AdminIcon name="chevronDown" className="w-3 h-3 text-slate-400" strokeWidth={2} />
          </AdminButton>

          <AdminButton variant="secondary" size="sm" className="gap-1.5 text-[11px]">
            <span>Any Status</span>
            <AdminIcon name="chevronDown" className="w-3 h-3 text-slate-400" strokeWidth={2} />
          </AdminButton>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <AdminButton variant="secondary" size="sm" className="gap-1.5 text-[11px]">
            <AdminIcon name="filter" className="w-3 h-3 text-slate-400" strokeWidth={2} />
            Filters
          </AdminButton>
          <AdminButton variant="primary" size="sm" className="gap-1.5 text-[11px]">
            <AdminIcon name="plus" className="w-3 h-3" strokeWidth={2.5} />
            Add Staff
          </AdminButton>
        </div>
      </div>
    </div>
  );

  const columns = useMemo<ColumnDef<StaffMember>[]>(() => [
    {
      id: 'id',
      header: 'Staff ID',
      accessorKey: 'id',
      cellClassName: 'font-medium text-[var(--admin-primary)] text-[13px]',
    },
    {
      id: 'staff',
      header: 'Staff Profile',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-semibold text-slate-900 leading-none">{row.name}</span>
          <span className="text-[12px] text-slate-500 leading-none">{row.email}</span>
        </div>
      )
    },
    {
      id: 'role',
      header: 'Role & Dept',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-slate-700 font-medium leading-none">{row.role}</span>
          <span className="text-[12px] text-slate-500 leading-none">{row.department}</span>
        </div>
      )
    },
    {
      id: 'shift',
      header: 'Shift Schedule',
      accessorKey: 'shift',
      cellClassName: 'text-[13px] text-slate-700',
    },
    {
      id: 'contact',
      header: 'Contact',
      accessorKey: 'phone',
      cellClassName: 'text-[13px] text-slate-700',
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        let colors = '';
        if (row.status === 'On Duty') {
          colors = 'bg-emerald-50 text-emerald-600 border-emerald-200/60';
        } else if (row.status === 'On Leave') {
          colors = 'bg-amber-50 text-amber-600 border-amber-200/60';
        } else {
          colors = 'bg-slate-100 text-slate-600 border-slate-200/60';
        }
        
        return (
          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${colors}`}>
            {row.status}
          </div>
        );
      }
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
            onRowClick={(row) => console.log('Navigate to staff', row.id)}
            pagination={{
              currentPage,
              totalPages: Math.ceil(filteredStaff.length / itemsPerPage),
              totalItems: filteredStaff.length,
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
