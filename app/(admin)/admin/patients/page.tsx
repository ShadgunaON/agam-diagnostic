'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminCard } from '@/components/admin/primitives/AdminCard';
import { AdminInput } from '@/components/admin/primitives/AdminInput';
import { AdminButton } from '@/components/admin/primitives/AdminButton';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { KPICard } from '@/components/admin/layout/KPICard';
import { ConfigurableDataTable, ColumnDef } from '@/components/admin/tables/DataTable';
import { patientService, analyticsService } from '@/services';
import { PatientModel } from '@/domains/patient/model';
import { useToast } from '@/components/admin/feedback/Toast';

export default function PatientsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [kpis, setKpis] = useState({ totalPatients: 0, newThisMonth: 0, activeBookings: 0, retentionRate: 0 });
  
  const [patients, setPatients] = useState<PatientModel[]>([]);

  useEffect(() => {
    setMounted(true);
    analyticsService.getPatientKPIs().then(setKpis);
  }, []);

  useEffect(() => {
    const loadPatients = async () => {
      const result = await patientService.getAll(1, 1000); // load all for client-side search in mock
      if (result.isSuccess && result.value) {
        setPatients(result.value.data);
      }
    };
    loadPatients();
  }, []);

  const filteredPatients = React.useMemo(() => {
    if (!searchQuery) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      p.phone.includes(query) ||
      p.email.toLowerCase().includes(query)
    );
  }, [patients, searchQuery]);

  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage, itemsPerPage]);


  const kpiSection = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <KPICard 
        title="Total Patients" 
        value={kpis.totalPatients.toLocaleString()} 
        icon="users"
        trend={{ value: 4.2, isPositive: true, label: 'vs last month' }}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-500"
      />
      <KPICard 
        title="New This Month" 
        value={kpis.newThisMonth.toLocaleString()} 
        icon="userPlus"
        trend={{ value: 12, isPositive: true, label: 'vs last month' }}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-500"
      />
      <KPICard 
        title="Active Bookings" 
        value={kpis.activeBookings.toLocaleString()} 
        icon="calendar"
        trend={{ value: 2, isPositive: false, label: 'needs attention' }}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-500"
      />
      <KPICard 
        title="Retention Rate" 
        value={`${kpis.retentionRate}%`} 
        icon="activity"
        trend={{ value: 1.5, isPositive: true, label: 'vs last year' }}
        iconBgColor="bg-rose-50"
        iconColor="text-rose-500"
      />
    </div>
  );

  const toolbar = (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full max-w-2xl">
          {/* Search */}
          <div className="w-full sm:w-64 shrink-0 group">
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

  const columns = React.useMemo<ColumnDef<PatientModel>[]>(() => [
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
      accessorKey: 'updatedAt',
      cellClassName: 'text-[13px] text-slate-700 font-medium',
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

  if (!mounted) return null;

  return (
    <AdminPageTemplate
      kpiSection={kpiSection}
    >
      <div className="mb-10">
        <AdminCard padding="none" className="overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4 sm:p-6">
            {toolbar}
          </div>
          <ConfigurableDataTable
            data={paginatedData}
            columns={columns}
            keyExtractor={(row) => row.id}
            onRowClick={(row) => router.push(`/admin/patients/${row.id}`)}
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
