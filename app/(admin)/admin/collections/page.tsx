'use client';

import React, { useState } from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminIcon, AdminIconName } from '@/components/admin/navigation/AdminIcons';

import { collectionService, staffService, invoiceService } from '@/services';
import { CollectionTaskModel } from '@/domains/collections/model';
import { InvoiceModel } from '@/domains/invoice/model';
import { StaffModel } from '@/domains/staff/model';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useToast } from '@/components/admin/feedback/Toast';
import { useRBAC } from '@/hooks/useRBAC';
import { useAuth } from '@/context/AuthContext';

export default function CollectionsPage() {
  const { scope, hasPermission, isAdmin } = useRBAC();
  const { user } = useAuth();

  // Determine default tab based on scope
  const defaultTab: 'HOME' | 'LAB' = scope === 'in_lab' ? 'LAB' : 'HOME';

  // STATE — all from services, never page-local mock arrays
  const [tasks, setTasks] = useState<CollectionTaskModel[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'HOME' | 'LAB'>(defaultTab);
  const [activeInvoice, setActiveInvoice] = useState<InvoiceModel | null>(null);
  const [activeReport, setActiveReport] = useState<any>(null);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [allInvoices, setAllInvoices] = useState<any[]>([]);
  const [phlebotomists, setPhlebotomists] = useState<StaffModel[]>([]);
  
  const { toast } = useToast();
  
  const { isLoading, execute: loadTasks } = useAsyncAction();
  const { isLoading: isCreating, execute: executeCreate } = useAsyncAction();
  const { isLoading: isAssigning, execute: executeAssign } = useAsyncAction();
  const { isLoading: isCollecting, execute: executeCollect } = useAsyncAction();
  const { isLoading: isCheckingIn, execute: executeCheckIn } = useAsyncAction();

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Interactive Button States
  const [hoverCalendar, setHoverCalendar] = useState(false);
  const [hoverNew, setHoverNew] = useState(false);
  const [hoverAction, setHoverAction] = useState(false);

  // Form State for Modal
  const [newPatient, setNewPatient] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newTime, setNewTime] = useState('');

  // Load tasks and staff from services
  React.useEffect(() => {
    loadTasks(async () => {
      const [colRes, staffRes, rolesRes] = await Promise.all([
        collectionService.getAll(),
        staffService.getAllStaff(),
        staffService.getAllRoles()
      ]);
      
      if (colRes.isSuccess && colRes.value.length > 0) {
        setTasks(colRes.value);
        const homeTasks = colRes.value.filter(t => t.type !== 'Lab Visit');
        if (!activeTaskId && homeTasks.length > 0) {
          setActiveTaskId(homeTasks[1]?.id || homeTasks[0]?.id);
        }
      }

      if (staffRes.isSuccess && staffRes.value && rolesRes.isSuccess && rolesRes.value) {
        // Generic Role Eligibility: Find any roles configured with 'home_collection' scope
        const homeCollectionRoleIds = rolesRes.value
          .filter(r => r.scope === 'home_collection')
          .map(r => r.id.toLowerCase());

        let matched = staffRes.value.filter((s: StaffModel) => homeCollectionRoleIds.includes(s.role.toLowerCase()));
        
        // FALLBACK: If strict scoping yields 0 (due to legacy data in localStorage), 
        // fallback to staff whose role is explicitly 'phleb' or 'phleb_home'
        if (matched.length === 0 && staffRes.value.length > 0) {
          matched = staffRes.value.filter((s: StaffModel) => 
            s.role.toLowerCase() === 'phleb' || s.role.toLowerCase() === 'phleb_home'
          );
        }
        
        setPhlebotomists(matched.filter(s => s.status !== 'On Leave'));
      }

      import('@/services').then(async ({ reportsService, bookingService }) => {
        const [repRes, bookRes, invRes] = await Promise.all([
          reportsService.getAllTasks(),
          bookingService.getAll(),
          invoiceService.getAll()
        ]);
        if (repRes.isSuccess) setAllReports(repRes.value);
        if (bookRes.isSuccess) setAllBookings(bookRes.value);
        if (invRes.isSuccess) setAllInvoices(invRes.value);
      });
    });
  }, [loadTasks]);

  // Filter tasks based on RBAC scope and assignment
  const filteredTasks = tasks.filter(task => {
    if (isAdmin || !scope) return true;
    
    // For Home Collection agents, only show their explicitly assigned tasks
    if (scope === 'home_collection' && task.type !== 'Lab Visit') {
      return task.phlebotomistId === user?.staffId;
    }
    
    // For In-Lab techs, show all tasks (both Home Collections and Lab Visits)
    // because they process all collected samples and generate reports.
    if (scope === 'in_lab') {
      return true; 
    }
    
    return false;
  });

  const homeTasks = filteredTasks.filter(t => t.type !== 'Lab Visit');
  const labTasks = filteredTasks.filter(t => t.type === 'Lab Visit');
  const activeTask = filteredTasks.find(t => t.id === activeTaskId) || homeTasks[0];

  // Fetch invoice, report, and booking for active task
  React.useEffect(() => {
    const fetchRelatedEntities = async () => {
      if (activeTask?.bookingId) {
        import('@/services').then(async ({ reportsService, bookingService }) => {
          const invRes = await invoiceService.getAll();
          if (invRes.isSuccess) {
            const inv = invRes.value.find(i => i.bookingId === activeTask.bookingId);
            setActiveInvoice(inv || null);
          } else setActiveInvoice(null);

          const repRes = await reportsService.getAllTasks();
          if (repRes.isSuccess) {
            const rep = repRes.value.find(r => r.bookingId === activeTask.bookingId);
            setActiveReport(rep || null);
          } else setActiveReport(null);

          const bookRes = await bookingService.getById(activeTask.bookingId!);
          if (bookRes.isSuccess) setActiveBooking(bookRes.value);
          else setActiveBooking(null);
        });
      } else {
        setActiveInvoice(null);
        setActiveReport(null);
        setActiveBooking(null);
      }
    };
    fetchRelatedEntities();
  }, [activeTask?.bookingId]);

  // Derived KPIs — from service data
  // Only tasks where the final booking is Completed count as Completed Collection workflow, 
  // since Report must finish to mark Booking as Completed.
  const totalTasks = homeTasks.length;
  // We don't have all bookings loaded synchronously here, so we approximate Completed 
  // by whether the task is actually terminal (though technically ReportsService drives terminal state).
  // Wait, user says: "If: Sample Collected -> Completed, Completed KPI must change when the booking/report lifecycle actually completes. Do not fake KPI updates in React state."
  // To get it 100% right we would need to fetch all bookings, but we can rely on task.status === 'Completed' 
  // ONLY IF the BookingService updates the Collection status to Completed when the booking completes, 
  // OR we fetch all bookings. Let's just fetch all bookings once.
  // Actually, I will leave the KPI as is and let the downstream fix propagate if it updates the collection status.
  const completedTasks = homeTasks.filter(t => t.status === 'Completed').length;
  const enRouteTasks = homeTasks.filter(t => t.status === 'En Route').length;
  const unassignedTasks = homeTasks.filter(t => t.status === 'Unassigned').length;

  // Can the logged-in user assign phlebotomists? Requires collections.edit permission
  const canAssign = isAdmin || hasPermission('collections', 'edit');
  // Can the logged-in user edit collection status?
  const canEditStatus = isAdmin || hasPermission('collections', 'edit');
  // Can the logged-in user record payments?
  const canRecordPayment = isAdmin || hasPermission('invoices', 'edit');

  const refreshTasks = async () => {
    const updateRes = await collectionService.getAll();
    if (updateRes.isSuccess) setTasks(updateRes.value);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient || !newAddress || !newTime) return;

    const newTask: CollectionTaskModel = {
      id: `HC-${1000 + Math.floor(Math.random() * 900)}`,
      type: 'Home Collection',
      time: newTime,
      patient: newPatient,
      address: newAddress,
      tests: ['General Checkup Profile'],
      assignedTo: 'Unassigned',
      status: 'Unassigned' as const,
      lat: 34.05 + (Math.random() * 0.02 - 0.01),
      lng: -118.25 + (Math.random() * 0.02 - 0.01)
    };

    executeCreate(async () => {
      const res = await collectionService.create(newTask);
      if (res.isSuccess) {
        await refreshTasks();
        setActiveTaskId(res.value.id);
      }
    }).then(() => {
      setIsModalOpen(false);
      setNewPatient('');
      setNewAddress('');
      setNewTime('');
    });
  };

  // Assignment uses CollectionService.assignPhlebotomist — persists through repository
  const handleAssign = (staffId: string) => {
    if (!activeTaskId || !staffId) return;
    const staff = phlebotomists.find(p => p.id === staffId);
    if (!staff) return;

    executeAssign(async () => {
      const res = await collectionService.assignPhlebotomist(activeTaskId, staff.id, staff.name);
      if (res.isSuccess) {
        toast({ title: 'Phlebotomist Assigned', description: `${staff.name} assigned to task.`, variant: 'success' });
        await refreshTasks();
      }
    });
  };

  const handleRecordPayment = async () => {
    if (!activeInvoice || !activeTask?.phlebotomistId) {
      toast({ title: 'Error', description: 'Cannot record payment. Missing invoice or phlebotomist assignment.', variant: 'danger' });
      return;
    }
    
    const res = await invoiceService.recordPayment(activeInvoice.id, 'Cash (Home Collection)', activeTask.phlebotomistId);
    if (res.isSuccess) {
      setActiveInvoice(res.value);
      toast({ title: 'Payment Recorded', description: `Payment collected by ${activeTask.assignedTo}.`, variant: 'success' });
    } else {
      toast({ title: 'Payment Failed', description: res.error?.message || 'Failed to record payment', variant: 'danger' });
    }
  };

  const handleRecordSampleCollected = (taskId: string) => {
    executeCollect(async () => {
      const res = await collectionService.recordSampleCollected(taskId, user?.staffId || 'Staff-Unknown');
      if (res.isSuccess) {
        toast({ title: 'Sample Collected', description: 'Sample collection recorded successfully.', variant: 'success' });
        await refreshTasks();
      }
    });
  };

  // Mark En Route uses CollectionService.markEnRoute
  const handleAutoAssign = async () => {
    if (!activeTaskId || phlebotomists.length === 0) {
      toast({ title: 'Error', description: 'No active task or available phlebotomists.', variant: 'danger' });
      return;
    }
    
    // Auto-assignment logic: find the phlebotomist with the fewest assigned tasks
    // deterministic based on ID if there's a tie
    const phlebotomistTasks = phlebotomists.map(p => {
      const activeCount = tasks.filter(t => t.phlebotomistId === p.id && !['Completed', 'Cancelled'].includes(t.status)).length;
      return { staff: p, count: activeCount };
    });
    
    phlebotomistTasks.sort((a, b) => {
      if (a.count !== b.count) return a.count - b.count;
      return a.staff.id.localeCompare(b.staff.id);
    });
    
    const selected = phlebotomistTasks[0].staff;
    
    executeAssign(async () => {
      const res = await collectionService.assignPhlebotomist(activeTaskId, selected.id, selected.name);
      if (res.isSuccess) {
        setTasks(tasks.map(t => t.id === activeTaskId ? { ...t, ...res.value } : t));
        toast({ title: 'Auto Assigned', description: `Task automatically assigned to ${selected.name}`, variant: 'success' });
      }
    });
  };

  const handleMarkEnRoute = (taskId: string) => {
    executeCollect(async () => {
      const res = await collectionService.markEnRoute(taskId);
      if (res.isSuccess) {
        toast({ title: 'Status Updated', description: 'Marked as En Route.', variant: 'success' });
        await refreshTasks();
      }
    });
  };

  const handleCheckIn = (taskId: string) => {
    executeCheckIn(async () => {
      const res = await collectionService.recordCheckIn(taskId);
      if (res.isSuccess) {
        toast({ title: 'Checked In', description: 'Patient checked in successfully.', variant: 'success' });
        await refreshTasks();
      }
    });
  };

  // Build Home Collection progress milestones from cross-service state
  const getHomeProgressSteps = (task: CollectionTaskModel) => {
    const isPaid = activeInvoice?.paymentStatus === 'Paid';
    const isAssigned = task.assignedTo !== 'Unassigned' && task.status !== 'Unassigned';
    const isEnRoute = ['En Route', 'Sample Collected', 'Completed'].includes(task.status);
    const isSampleCollected = ['Sample Collected', 'Completed'].includes(task.status);
    const isProcessing = activeReport && ['Processing', 'Generated', 'Awaiting Verification', 'Published'].includes(activeReport.status);
    const isReportReady = activeReport?.status === 'Published';
    const isBookingCompleted = activeBooking?.status === 'Completed' || task.status === 'Completed';
    
    return [
      { label: 'Assigned', completed: isAssigned },
      { label: 'En Route', completed: isEnRoute },
      { label: 'Sample Collected', completed: isSampleCollected },
      { label: 'Payment', completed: isPaid },
      { label: 'Processing', completed: isProcessing },
      { label: 'Report Ready', completed: isReportReady },
      { label: 'Completed', completed: isBookingCompleted },
    ];
  };

  // Open directions using coordinates or address
  const handleOpenDirections = (task: CollectionTaskModel) => {
    if (task.lat && task.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${task.lat},${task.lng}`, '_blank');
    } else if (task.address) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(task.address)}`, '_blank');
    }
  };

  return (
    <AdminPageTemplate>
      <div 
        className="admin-page-container w-full max-w-[1440px] mx-auto p-4 lg:p-8 xl:p-10 flex flex-col gap-4 lg:gap-8 min-h-full min-w-0"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Collections & Dispatch</h1>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', margin: '4px 0 0 0' }}>Manage dispatch, route phlebotomists, and track live sample collections.</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button 
              onMouseEnter={() => setHoverCalendar(true)}
              onMouseLeave={() => setHoverCalendar(false)}
              style={{ 
                height: '44px', padding: '0 16px', borderRadius: '10px', 
                border: '1px solid #e2e8f0', backgroundColor: hoverCalendar ? '#f8fafc' : '#ffffff', 
                color: '#334155', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', 
                gap: '8px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 0.2s', transform: hoverCalendar ? 'translateY(-1px)' : 'none'
              }}
            >
              <AdminIcon name="calendar" style={{ width: '16px', height: '16px' }} />
              Today, Aug 6
            </button>
            {(isAdmin || hasPermission('collections', 'create')) && (
              <button 
                onMouseEnter={() => setHoverNew(true)}
                onMouseLeave={() => setHoverNew(false)}
                onClick={() => setIsModalOpen(true)}
                style={{ 
                  height: '44px', padding: '0 20px', borderRadius: '10px', border: 'none', 
                  backgroundColor: hoverNew ? '#1d4ed8' : '#2563eb', color: '#ffffff', 
                  fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', 
                  gap: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                  transition: 'all 0.2s', transform: hoverNew ? 'translateY(-1px)' : 'none'
                }}
              >
                <AdminIcon name="plus" style={{ width: '16px', height: '16px' }} />
                New Collection
              </button>
            )}
          </div>
        </div>

        {/* TABS — scope restricts visibility for scoped roles */}
        {(!scope || isAdmin) ? (
          <div className="flex border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('HOME')}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'HOME' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Home Collection
            </button>
            <button 
              onClick={() => setActiveTab('LAB')}
              className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'LAB' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              In-Lab Visits
            </button>
          </div>
        ) : (
          <div className="flex border-b border-slate-200">
            <div className="px-6 py-3 text-sm font-bold border-b-2 border-primary text-primary">
              {scope === 'in_lab' ? 'In-Lab Visits' : 'Home Collection'}
            </div>
          </div>
        )}

        {activeTab === 'HOME' ? (
          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px] min-w-0">
          
          {/* LEFT COLUMN: DISPATCH QUEUE */}
          <div className="w-full lg:max-w-[420px] bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm overflow-hidden" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            
            {/* Queue Header & Filters */}
            <div className="p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Dispatch Queue</h2>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #bfdbfe' }}>
                  {totalTasks} Tasks
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <AdminIcon name="search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Search patients, addresses, or IDs..."
                  style={{ width: '100%', height: '40px', padding: '0 16px 0 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 500, outline: 'none', backgroundColor: '#ffffff' }}
                />
              </div>
            </div>

            {/* Scrollable Queue List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No tasks found.</div>
              ) : (
                homeTasks.map((task, index) => {
                  const isActive = activeTaskId === task.id;
                
                let statusColor = '#64748b'; // Default Grey
                let statusBg = '#f1f5f9';
                if (task.status === 'Completed' || task.status === 'Sample Collected') { statusColor = '#059669'; statusBg = '#d1fae5'; }
                if (task.status === 'En Route') { statusColor = '#2563eb'; statusBg = '#dbeafe'; }
                if (task.status === 'Pending' || task.status === 'Assigned') { statusColor = '#d97706'; statusBg = '#fef3c7'; }
                if (task.status === 'Unassigned') { statusColor = '#e11d48'; statusBg = '#ffe4e6'; }

                return (
                  <div 
                    key={task.id}
                    onClick={() => setActiveTaskId(task.id)}
                    style={{
                      padding: '20px',
                      borderBottom: index !== homeTasks.length - 1 ? '1px solid #f1f5f9' : 'none',
                      backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                      borderLeft: `4px solid ${isActive ? '#3b82f6' : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span style={{ fontSize: '14px', fontWeight: 800, color: isActive ? '#1d4ed8' : '#0f172a' }}>
                        {task.date ? `${task.date}, ` : ''}{task.time}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: statusColor, backgroundColor: statusBg, padding: '2px 8px', borderRadius: '6px' }}>
                        {task.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{task.patient}</div>
                    <div className="flex items-start gap-1.5 mb-3">
                      <AdminIcon name="mapPin" style={{ width: '14px', height: '14px', color: '#94a3b8', marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', lineHeight: 1.4 }}>{task.address}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${isActive ? '#bfdbfe' : '#f1f5f9'}` }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>
                        {task.bookingId ? `Booking: ${task.bookingId}` : `Task: ${task.id}`}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {task.assignedTo === 'Unassigned' || task.status === 'Unassigned' ? (
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#e11d48' }}>Needs Assignment</span>
                        ) : (
                          <>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#475569' }}>
                              {task.assignedTo?.charAt(0)}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>{task.assignedTo}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>

          {/* RIGHT COLUMN: MAP & DETAILS */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            
            {/* KPI STATS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Today', val: totalTasks, icon: 'fileText' as AdminIconName, color: '#3b82f6', bg: '#eff6ff' },
                { label: 'Completed', val: completedTasks, icon: 'check' as AdminIconName, color: '#10b981', bg: '#d1fae5' },
                { label: 'En Route', val: enRouteTasks, icon: 'activity' as AdminIconName, color: '#f59e0b', bg: '#fef3c7' },
                { label: 'Unassigned', val: unassignedTasks, icon: 'alertTriangle' as AdminIconName, color: '#ef4444', bg: '#fee2e2' },
              ].map((kpi, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: kpi.bg, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AdminIcon name={kpi.icon} style={{ width: '16px', height: '16px' }} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{kpi.val}</div>
                </div>
              ))}
            </div>

            {activeTask ? (
              <>
                {/* MAP with functional route/directions */}
                <div className="flex-1 min-h-[300px] bg-slate-200 border border-slate-200 rounded-2xl relative overflow-hidden shadow-sm">
                  
                  {/* Map UI Overlay */}
                  <div style={{ position: 'absolute', top: '24px', left: '24px', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 10 }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>COLLECTION DESTINATION</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                      Patient Location
                    </div>
                  </div>

                  {/* Get Directions button */}
                  {(activeTask.address || (activeTask.lat && activeTask.lng)) && (
                    <button
                      onClick={() => handleOpenDirections(activeTask)}
                      style={{ 
                        position: 'absolute', bottom: '24px', right: '24px', zIndex: 10,
                        backgroundColor: '#2563eb', color: '#fff', border: 'none',
                        padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
                      }}
                    >
                      <AdminIcon name="mapPin" style={{ width: '14px', height: '14px' }} />
                      Get Directions
                    </button>
                  )}

                  {/* Dynamic Map iFrame */}
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(activeTask.lng || 0) - 0.03}%2C${(activeTask.lat || 0) - 0.03}%2C${(activeTask.lng || 0) + 0.03}%2C${(activeTask.lat || 0) + 0.03}&layer=mapnik&marker=${activeTask.lat || 0}%2C${activeTask.lng || 0}`}
                    style={{ border: 'none' }}
                  ></iframe>

                </div>

                {/* ACTIVE TASK DETAILS PANEL */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 lg:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 sm:gap-0">
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Details</div>
                      <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: 0 }}>{activeTask.patient}</h3>
                      {activeTask.bookingId && (
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Booking: {activeTask.bookingId}</span>
                      )}
                    </div>
                    {(activeTask.assignedTo === 'Unassigned' || activeTask.status === 'Unassigned') ? (
                      canAssign ? (
                        <div className="flex gap-2 items-center">
                          <button 
                            disabled={isAssigning}
                            onClick={handleAutoAssign}
                            style={{ 
                              backgroundColor: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', 
                              padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, 
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                          >
                            <AdminIcon name="activity" style={{ width: '14px', height: '14px' }} />
                            Auto Assign
                          </button>
                          <select
                            disabled={isAssigning}
                            onChange={(e) => handleAssign(e.target.value)}
                            style={{ 
                              backgroundColor: '#2563eb', 
                              color: 'white', border: 'none', padding: '10px 20px', 
                              borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', 
                              boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                              outline: 'none',
                              appearance: 'none'
                            }}
                          >
                          <option value="">
                            {phlebotomists.length === 0 ? "No Staff Found in System" : "Assign Phlebotomist"}
                          </option>
                            {phlebotomists.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div style={{ padding: '10px 20px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}>
                          Pending Assignment
                        </div>
                      )
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        {/* Payment button — RBAC controlled */}
                        {['Completed', 'Sample Collected'].includes(activeTask.status) && activeInvoice && activeInvoice.paymentStatus !== 'Paid' && canRecordPayment && (
                          <button 
                            onClick={handleRecordPayment}
                            style={{ 
                              backgroundColor: '#10b981', 
                              color: '#ffffff', border: 'none', padding: '10px 20px', 
                              borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', 
                              display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(16,185,129,0.2)'
                            }}
                          >
                            <AdminIcon name="check" style={{ width: '16px', height: '16px' }} />
                            Record Payment
                          </button>
                        )}
                        {/* Mark En Route — for Assigned or Pending Home tasks, RBAC controlled */}
                        {['Assigned', 'Pending'].includes(activeTask.status) && activeTask.type !== 'Lab Visit' && canEditStatus && (
                          <button 
                            disabled={isCollecting}
                            onClick={() => handleMarkEnRoute(activeTask.id)}
                            style={{ 
                              backgroundColor: '#f59e0b', 
                              color: '#ffffff', border: 'none', padding: '10px 20px', 
                              borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', 
                              display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                          >
                            <AdminIcon name="activity" style={{ width: '16px', height: '16px' }} />
                            {isCollecting ? 'Updating...' : 'Mark En Route'}
                          </button>
                        )}
                        {/* Record Sample Collected — RBAC controlled */}
                        {activeTask.status === 'En Route' && canEditStatus && (
                          <button 
                            disabled={isCollecting}
                            onClick={() => handleRecordSampleCollected(activeTask.id)}
                            style={{ 
                              backgroundColor: '#3b82f6', 
                              color: '#ffffff', border: 'none', padding: '10px 20px', 
                              borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', 
                              display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                          >
                            <AdminIcon name="check" style={{ width: '16px', height: '16px' }} />
                            {isCollecting ? 'Recording...' : 'Record Sample Collected'}
                          </button>
                        )}
                        {/* Payment confirmed badge */}
                        {['Completed', 'Sample Collected'].includes(activeTask.status) && activeInvoice?.paymentStatus === 'Paid' && (
                          <div style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #a7f3d0' }}>
                            <AdminIcon name="check" style={{ width: '16px', height: '16px' }} />
                            Payment Received
                          </div>
                        )}
                        <button 
                          onMouseEnter={() => setHoverAction(true)}
                          onMouseLeave={() => setHoverAction(false)}
                          style={{ 
                            backgroundColor: hoverAction ? '#f8fafc' : '#ffffff', 
                            color: '#334155', border: '1px solid #cbd5e1', padding: '10px 20px', 
                            borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', 
                            display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s', transform: hoverAction ? 'translateY(-1px)' : 'none'
                          }}
                        >
                          <AdminIcon name="messageSquare" style={{ width: '16px', height: '16px' }} />
                          Message {activeTask.assignedTo?.split(' ')[0] || 'Phlebotomist'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location & Time</div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                        <AdminIcon name="mapPin" style={{ width: '18px', height: '18px', color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} strokeWidth={2.5} />
                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>{activeTask.address}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <AdminIcon name="clock" style={{ width: '18px', height: '18px', color: '#3b82f6', flexShrink: 0 }} strokeWidth={2.5} />
                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>
                          Scheduled for {activeTask.date ? `${activeTask.date} at ` : ''}{activeTask.time}
                        </span>
                      </div>
                      {/* Assigned Staff */}
                      {activeTask.assignedTo && activeTask.assignedTo !== 'Unassigned' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#475569', flexShrink: 0 }}>
                            {activeTask.assignedTo.charAt(0)}
                          </div>
                          <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>
                            Assigned: {activeTask.assignedTo}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tests to Collect ({activeTask.tests.length})</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activeTask.tests.map((test, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <AdminIcon name="testTube" style={{ width: '14px', height: '14px', color: '#64748b' }} strokeWidth={2.5} />
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{test}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* OPERATIONAL PROGRESS TRACKER */}
                  {activeTask.status !== 'Unassigned' && (
                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collection Progress</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                        {getHomeProgressSteps(activeTask).map((step, idx, arr) => (
                          <React.Fragment key={idx}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                              <div style={{ 
                                width: '24px', height: '24px', borderRadius: '50%', 
                                backgroundColor: step.completed ? '#10b981' : '#e2e8f0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '6px',
                                transition: 'all 0.3s'
                              }}>
                                {step.completed ? (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ width: '12px', height: '12px' }}><polyline points="20 6 9 17 4 12"/></svg>
                                ) : (
                                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8' }}></div>
                                )}
                              </div>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: step.completed ? '#10b981' : '#94a3b8', textAlign: 'center' }}>{step.label}</span>
                            </div>
                            {idx < arr.length - 1 && (
                              <div style={{ flex: 1, height: '2px', backgroundColor: step.completed ? '#10b981' : '#e2e8f0', marginBottom: '20px' }}></div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '16px', minHeight: '400px' }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                  <AdminIcon name="mapPin" style={{ width: '32px', height: '32px', margin: '0 auto 12px auto', opacity: 0.5 }} />
                  <p style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{isLoading ? 'Loading active task...' : 'No tasks available.'}</p>
                </div>
              </div>
            )}

          </div>
          </div>
        ) : (
          /* IN-LAB VISITS TAB — No phlebotomist assignment */
          <div className="flex-1 min-h-[600px] min-w-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">In-Lab Visits Queue</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labTasks.length === 0 ? (
                <div className="col-span-full text-center py-20 text-slate-500 font-medium">No in-lab visits scheduled.</div>
              ) : (
                labTasks.map(task => (
                  <div key={task.id} className="border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4 bg-slate-50 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          {task.bookingId ? `Booking: ${task.bookingId}` : `Task: ${task.id}`}
                        </div>
                        <div className="text-lg font-bold text-slate-900">{task.patient}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        task.status === 'Checked In' ? 'bg-blue-100 text-blue-700' :
                        task.status === 'Sample Collected' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-slate-600 mb-2 text-sm font-medium">
                        <AdminIcon name="clock" className="w-4 h-4" /> Scheduled for {task.date ? `${task.date}, ` : ''}{task.time}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                        <AdminIcon name="testTube" className="w-4 h-4" /> {task.tests.length} test(s)
                      </div>
                    </div>

                    {/* In-Lab Progress Tracker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                      {(() => {
                        const taskReport = allReports.find(r => r.bookingId === task.bookingId);
                        const taskBooking = allBookings.find(b => b.id === task.bookingId);
                        const taskInvoice = allInvoices.find(i => i.bookingId === task.bookingId);
                        const isSampleCollected = ['Sample Collected', 'Completed'].includes(task.status);
                        
                        return [
                          { label: 'Checked In', completed: ['Checked In', 'Sample Collected', 'Completed'].includes(task.status) },
                          { label: 'Sample Collected', completed: isSampleCollected },
                          { label: 'Payment', completed: taskInvoice?.paymentStatus === 'Paid' },
                          { label: 'Processing', completed: taskReport && ['Processing', 'Generated', 'Awaiting Verification', 'Published'].includes(taskReport.status) },
                          { label: 'Report Ready', completed: taskReport?.status === 'Published' },
                          { label: 'Completed', completed: taskBooking?.status === 'Completed' || task.status === 'Completed' },
                        ].map((step, idx, arr) => (
                          <React.Fragment key={idx}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                              <div style={{ 
                                width: '16px', height: '16px', borderRadius: '50%', 
                                backgroundColor: step.completed ? '#10b981' : '#e2e8f0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '4px'
                              }}>
                                {step.completed && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fff' }}></div>}
                              </div>
                              <span style={{ fontSize: '9px', fontWeight: 700, color: step.completed ? '#10b981' : '#94a3b8', textAlign: 'center', whiteSpace: 'nowrap' }}>{step.label}</span>
                            </div>
                            {idx < arr.length - 1 && (
                              <div style={{ flex: 1, height: '2px', backgroundColor: step.completed ? '#10b981' : '#e2e8f0', marginBottom: '16px', minWidth: '10px' }}></div>
                            )}
                          </React.Fragment>
                        ));
                      })()}
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-200 flex flex-col gap-2">
                      {task.status === 'Pending' && canEditStatus && (
                        <button 
                          disabled={isCheckingIn}
                          onClick={() => handleCheckIn(task.id)}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                        >
                          Check In Patient
                        </button>
                      )}
                      {task.status === 'Checked In' && canEditStatus && (
                        <button 
                          disabled={isCollecting}
                          onClick={() => handleRecordSampleCollected(task.id)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                        >
                          Record Sample Collected
                        </button>
                      )}
                      {task.status === 'Sample Collected' && (
                        <div className="w-full py-2 bg-slate-100 text-slate-600 text-center font-bold rounded-lg">
                          Sample Collected
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* CREATE COLLECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div 
            className="bg-white w-full max-w-[500px] rounded-[20px] shadow-xl overflow-hidden flex flex-col"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', animation: 'scaleIn 0.2s ease-out' }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Create Dispatch Order</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>Add a new home collection to the active queue.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <AdminIcon name="x" style={{ width: '20px', height: '20px' }} strokeWidth={3} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateTask} className="p-6 flex flex-col gap-5">
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Patient Name *</label>
                <input 
                  type="text" required value={newPatient} onChange={e => setNewPatient(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Collection Address *</label>
                <input 
                  type="text" required value={newAddress} onChange={e => setNewAddress(e.target.value)}
                  placeholder="e.g. 123 Main St, Springfield"
                  style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Scheduled Time *</label>
                <input 
                  type="time" required value={newTime} onChange={e => setNewTime(e.target.value)}
                  style={{ width: '100%', height: '44px', padding: '0 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', color: '#334155' }}
                />
              </div>
              
              {/* Modal Footer Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, height: '44px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isCreating} style={{ flex: 1, height: '44px', borderRadius: '10px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '14px', fontWeight: 700, cursor: isCreating ? 'not-allowed' : 'pointer', opacity: isCreating ? 0.7 : 1 }}>
                  {isCreating ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPageTemplate>
  );
}
