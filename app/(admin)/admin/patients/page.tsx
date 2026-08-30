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
  const [genderFilter, setGenderFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
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

  const filteredAndSortedPatients = React.useMemo(() => {
    let result = [...patients];

    if (genderFilter !== 'All') {
      result = result.filter(p => {
        if (genderFilter === 'Unknown/Unspecified') {
          return !p.gender;
        }
        return p.gender === genderFilter;
      });
    }

    if (statusFilter !== 'All') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.name?.toLowerCase() || '').includes(query) ||
        (p.id?.toLowerCase() || '').includes(query) ||
        (p.phone || '').includes(query) ||
        (p.email?.toLowerCase() || '').includes(query)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'oldest':
          return (a.createdAt || '').localeCompare(b.createdAt || '');
        case 'newest':
        default:
          return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
    });

    return result;
  }, [patients, genderFilter, statusFilter, searchQuery, sortBy]);

  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedPatients.slice(start, start + itemsPerPage);
  }, [filteredAndSortedPatients, currentPage, itemsPerPage]);

  const handleExportCSV = () => {
    if (filteredAndSortedPatients.length === 0) {
      toast({ title: 'No Data', description: 'No patients match the current filters to export.', variant: 'warning' });
      return;
    }

    const headers = ['Patient ID', 'Name', 'Phone', 'Email', 'Age', 'Gender', 'Blood Group', 'Status', 'Registered At'];
    
    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '""';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = filteredAndSortedPatients.map(p => [
      escapeCSV(p.id),
      escapeCSV(p.name),
      escapeCSV(p.phone),
      escapeCSV(p.email),
      escapeCSV(p.age),
      escapeCSV(p.gender),
      escapeCSV(p.bloodGroup),
      escapeCSV(p.status),
      escapeCSV(p.createdAt)
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'patients_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


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
          <select 
            value={genderFilter} 
            onChange={(e) => setGenderFilter(e.target.value)}
            className="h-8 px-2 text-[11px] font-medium bg-white border border-slate-200 rounded-md text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer"
            aria-label="Filter by Gender"
          >
            <option value="All">Any Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Unknown/Unspecified">Unknown/Unspecified</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2 text-[11px] font-medium bg-white border border-slate-200 rounded-md text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer"
            aria-label="Filter by Status"
          >
            <option value="All">Any Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="h-8 px-2 text-[11px] font-medium bg-white border border-slate-200 rounded-md text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer"
            aria-label="Sort By"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
          </select>
          <AdminButton variant="secondary" size="sm" className="gap-1.5 text-[11px]" onClick={handleExportCSV} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
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
              totalPages: Math.max(1, Math.ceil(filteredAndSortedPatients.length / itemsPerPage)),
              totalItems: filteredAndSortedPatients.length,
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
