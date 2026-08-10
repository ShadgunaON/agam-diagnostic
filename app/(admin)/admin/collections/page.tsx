'use client';

import React, { useState } from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminIcon, AdminIconName } from '@/components/admin/navigation/AdminIcons';

import { collectionService } from '@/services';
import { CollectionTaskModel } from '@/domains/collections/model';
import { useAsyncAction } from '@/hooks/useAsyncAction';

export default function CollectionsPage() {
  // STATE
  const [tasks, setTasks] = useState<CollectionTaskModel[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  
  const { isLoading, execute: loadTasks } = useAsyncAction();
  const { isLoading: isCreating, execute: executeCreate } = useAsyncAction();

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Interactive Button States
  const [hoverCalendar, setHoverCalendar] = useState(false);
  const [hoverNew, setHoverNew] = useState(false);
  const [hoverAction, setHoverAction] = useState(false);

  // Form State for Modal
  const [newPatient, setNewPatient] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newTime, setNewTime] = useState('');

  React.useEffect(() => {
    loadTasks(async () => {
      const result = await collectionService.getAll();
      if (result.isSuccess && result.value.length > 0) {
        setTasks(result.value);
        if (!activeTaskId) {
          setActiveTaskId(result.value[1]?.id || result.value[0]?.id);
        }
      }
    });
  }, [activeTaskId, loadTasks]);

  const activeTask = tasks.find(t => t.id === activeTaskId) || tasks[0];

  // Derived KPIs
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const enRouteTasks = tasks.filter(t => t.status === 'En Route').length;
  const unassignedTasks = tasks.filter(t => t.status === 'Unassigned').length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient || !newAddress || !newTime) return;

    const newTask: CollectionTaskModel = {
      id: `HC-${1000 + Math.floor(Math.random() * 900)}`,
      time: newTime,
      patient: newPatient,
      address: newAddress,
      tests: ['General Checkup Profile'],
      assignedTo: 'Unassigned',
      status: 'Unassigned' as const,
      // Generate slight random offset around central Springfield map area
      lat: 34.05 + (Math.random() * 0.02 - 0.01),
      lng: -118.25 + (Math.random() * 0.02 - 0.01)
    };

    executeCreate(async () => {
      const res = await collectionService.create(newTask);
      if (res.isSuccess) {
        setTasks(prev => [res.value, ...prev]);
        setActiveTaskId(res.value.id);
      }
    }).then(() => {
      setIsModalOpen(false);
      setNewPatient('');
      setNewAddress('');
      setNewTime('');
    });
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
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Home Collections</h1>
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
          </div>
        </div>

        {/* MAIN TWO-COLUMN DISPATCH VIEW */}
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
                tasks.map((task, index) => {
                  const isActive = activeTaskId === task.id;
                
                let statusColor = '#64748b'; // Default Grey
                let statusBg = '#f1f5f9';
                if (task.status === 'Completed') { statusColor = '#059669'; statusBg = '#d1fae5'; } // Emerald
                if (task.status === 'En Route') { statusColor = '#2563eb'; statusBg = '#dbeafe'; } // Blue
                if (task.status === 'Pending') { statusColor = '#d97706'; statusBg = '#fef3c7'; } // Amber
                if (task.status === 'Unassigned') { statusColor = '#e11d48'; statusBg = '#ffe4e6'; } // Rose

                return (
                  <div 
                    key={task.id}
                    onClick={() => setActiveTaskId(task.id)}
                    style={{
                      padding: '20px',
                      borderBottom: index !== tasks.length - 1 ? '1px solid #f1f5f9' : 'none',
                      backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                      borderLeft: `4px solid ${isActive ? '#3b82f6' : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span style={{ fontSize: '14px', fontWeight: 800, color: isActive ? '#1d4ed8' : '#0f172a' }}>{task.time}</span>
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
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>{task.id}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {task.assignedTo === 'Unassigned' ? (
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#e11d48' }}>Needs Assignment</span>
                        ) : (
                          <>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#475569' }}>
                              {task.assignedTo.charAt(0)}
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

          {/* RIGHT COLUMN: LIVE MAP & DETAILS */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            
            {/* KPI STATS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Today', val: totalTasks, icon: 'list' as AdminIconName, color: '#3b82f6', bg: '#eff6ff' },
                { label: 'Completed', val: completedTasks, icon: 'check' as AdminIconName, color: '#10b981', bg: '#d1fae5' },
                { label: 'En Route', val: enRouteTasks, icon: 'activity' as AdminIconName, color: '#f59e0b', bg: '#fef3c7' },
                { label: 'Unassigned', val: unassignedTasks, icon: 'alertCircle' as AdminIconName, color: '#ef4444', bg: '#fee2e2' },
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
                {/* THE LIVE DISPATCH MAP (OpenStreetMap iFrame Integration) */}
                <div className="flex-1 min-h-[300px] bg-slate-200 border border-slate-200 rounded-2xl relative overflow-hidden shadow-sm">
                  
                  {/* Map UI Overlay Elements */}
                  <div style={{ position: 'absolute', top: '24px', left: '24px', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 10 }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>LIVE GPS TRACKING</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'pulse 2s infinite' }}></div>
                      Tracking patient location coordinates
                    </div>
                  </div>

                  {/* Dynamic Map iFrame */}
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeTask.lng - 0.03}%2C${activeTask.lat - 0.03}%2C${activeTask.lng + 0.03}%2C${activeTask.lat + 0.03}&layer=mapnik&marker=${activeTask.lat}%2C${activeTask.lng}`}
                    style={{ border: 'none' }}
                  ></iframe>

                </div>

                {/* ACTIVE TASK DETAILS PANEL */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 lg:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 sm:gap-0">
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Details</div>
                      <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: 0 }}>{activeTask.patient}</h3>
                    </div>
                    {activeTask.assignedTo === 'Unassigned' ? (
                      <button 
                        onMouseEnter={() => setHoverAction(true)}
                        onMouseLeave={() => setHoverAction(false)}
                        style={{ 
                          backgroundColor: hoverAction ? '#1d4ed8' : '#2563eb', 
                          color: 'white', border: 'none', padding: '10px 20px', 
                          borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', 
                          boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                          transition: 'all 0.2s', transform: hoverAction ? 'translateY(-1px)' : 'none'
                        }}
                      >
                        Assign Phlebotomist
                      </button>
                    ) : (
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
                        Message {activeTask.assignedTo.split(' ')[0]}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location & Time</div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                        <AdminIcon name="mapPin" style={{ width: '18px', height: '18px', color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} strokeWidth={2.5} />
                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>{activeTask.address}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AdminIcon name="clock" style={{ width: '18px', height: '18px', color: '#3b82f6', flexShrink: 0 }} strokeWidth={2.5} />
                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>Scheduled for {activeTask.time}</span>
                      </div>
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
      </div>

      {/* CREATE COLLECTION MODAL (Inline Styles to Bypass Tailwind Bug) */}
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
