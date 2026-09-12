'use client';

import React, { useState } from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';

import { collectionService, invoiceService } from '@/services';
import { CollectionTaskModel } from '@/domains/collections/model';
import { InvoiceModel } from '@/domains/invoice/model';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useToast } from '@/components/admin/feedback/Toast';
import { useRBAC } from '@/hooks/useRBAC';
import { useAuth } from '@/context/AuthContext';

export default function CollectionsPage() {
  const { scope, hasPermission, isAdmin } = useRBAC();
  const { user } = useAuth();

  // Always LAB — Home Collection is temporarily disabled
  const activeTab = 'LAB' as const;

  // STATE
  const [tasks, setTasks] = useState<CollectionTaskModel[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('date_oldest');

  const { toast } = useToast();

  const { isLoading, execute: loadTasks } = useAsyncAction();
  const { isLoading: isCollecting, execute: executeCollect } = useAsyncAction();
  const { isLoading: isCheckingIn, execute: executeCheckIn } = useAsyncAction();

  // ── DATA FETCHING ──────────────────────────────────────────────────────────

  const fetchWorkspace = async (cursor: string | null = null, isNavigatingBack = false) => {
    loadTasks(async () => {
      try {
        const token = sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '';
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            query: `
              query AdminCollectionsWorkspace($limit: Int, $cursor: String, $tab: String, $sort: String, $search: String) {
                adminCollectionsWorkspace(limit: $limit, cursor: $cursor, tab: $tab, sort: $sort, search: $search) {
                  queue {
                    items {
                      id date time status patient address bookingId assignedTo phlebotomistId type tests
                    }
                    nextCursor
                  }
                  stats { totalTasks completedTasks enRouteTasks unassignedTasks }
                }
              }
            `,
            variables: { limit: 20, cursor, tab: activeTab, sort: sortKey, search: searchQuery }
          })
        });

        const json = await response.json();
        if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error');

        const data = json.data?.adminCollectionsWorkspace;
        if (data) {
          setTasks(data.queue.items || []);
          setNextCursor(data.queue.nextCursor || null);

          if (cursor && !isNavigatingBack) {
            setCursorHistory(prev => [...prev, cursor]);
          }
        }
      } catch (err) {
        console.error('Failed to load workspace', err);
      }
    });
  };

  React.useEffect(() => {
    setCursorHistory([]);
    fetchWorkspace(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortKey, searchQuery]);

  // ── RBAC FILTERS ───────────────────────────────────────────────────────────

  // Filter tasks based on RBAC scope — keep home_collection guard intact in case
  // the backend ever returns a mixed list; in_lab users see everything
  const filteredTasks = tasks.filter(task => {
    if (isAdmin || !scope) return true;
    if (scope === 'home_collection') {
      if (task.type !== 'Home Collection') return false;
      return task.phlebotomistId === user?.staffId;
    }
    if (scope === 'in_lab') return true;
    return false;
  });

  // Only render Lab Visit tasks on this page
  const labTasks = filteredTasks.filter(t => t.type === 'Lab Visit');

  // ── PERMISSIONS ────────────────────────────────────────────────────────────

  const canEditStatus = hasPermission('collections', 'edit');

  // ── ACTIONS ────────────────────────────────────────────────────────────────

  const refreshTasks = async () => {
    const updateRes = await collectionService.getAll();
    if (updateRes.isSuccess) setTasks(updateRes.value);
  };

  const handleCheckIn = (taskId: string) => {
    executeCheckIn(async () => {
      const res = await collectionService.recordCheckIn(taskId);
      if (res.isSuccess) {
        toast({ title: 'Checked In', description: 'Patient checked in successfully.', variant: 'success' });
        await refreshTasks();
      } else {
        toast({ title: 'Check In Failed', description: res.error?.message || 'Failed to check in patient.', variant: 'danger' });
      }
    });
  };

  const handleRecordSampleCollected = (taskId: string) => {
    executeCollect(async () => {
      const res = await collectionService.recordSampleCollected(taskId, user?.staffId || 'Staff-Unknown');
      if (res.isSuccess) {
        toast({ title: 'Sample Collected', description: 'Sample collection recorded successfully.', variant: 'success' });
        await refreshTasks();
      } else {
        toast({ title: 'Action Failed', description: res.error?.message || 'Failed to record sample collection.', variant: 'danger' });
      }
    });
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <AdminPageTemplate>
      <div
        className="admin-page-container w-full max-w-[1440px] mx-auto p-4 lg:p-8 xl:p-10 flex flex-col gap-4 lg:gap-8 min-h-full min-w-0"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Collections
            </h1>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', margin: '4px 0 0 0' }}>
              Track in-lab visit progress and confirm sample collection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <AdminIcon
                name="search"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patients or IDs..."
                style={{
                  height: '40px', padding: '0 16px 0 36px', borderRadius: '8px',
                  border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 500,
                  outline: 'none', backgroundColor: '#ffffff', width: '240px'
                }}
              />
            </div>
            {/* Sort */}
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="date_oldest">Booking Date (Oldest First)</option>
              <option value="date_newest">Booking Date (Newest First)</option>
            </select>
          </div>
        </div>

        {/* QUEUE GRID */}
        <div className="flex-1 min-h-[600px] min-w-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {isLoading ? (
            <div className="flex justify-center items-center py-20 text-slate-500 font-medium text-sm">
              Loading in-lab visits...
            </div>
          ) : labTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AdminIcon name="testTube" style={{ width: '24px', height: '24px', color: '#94a3b8' }} />
              </div>
              <p className="text-slate-500 font-semibold text-sm">No in-lab visits found.</p>
              <p className="text-slate-400 text-xs">Confirmed bookings with lab visits will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labTasks.map(task => (
                <div key={task.id} className="border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4 bg-slate-50 relative">

                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {task.bookingId ? `Booking: ${task.bookingId}` : `Task: ${task.id}`}
                      </div>
                      <div className="text-lg font-bold text-slate-900">{task.patient}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      task.status === 'Checked In'      ? 'bg-blue-100 text-blue-700'    :
                      task.status === 'Sample Collected' ? 'bg-emerald-100 text-emerald-700' :
                      task.status === 'Completed'       ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  {/* Schedule & Tests */}
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-2 text-sm font-medium">
                      <AdminIcon name="clock" className="w-4 h-4" />
                      {task.date ? `${task.date}, ` : ''}{task.time}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                      <AdminIcon name="testTube" className="w-4 h-4" />
                      {task.tests?.length ?? 0} test(s)
                    </div>
                    {(task.tests?.length ?? 0) > 0 && (
                      <div className="mt-2 flex flex-col gap-1">
                        {task.tests.map((test, idx) => (
                          <span key={idx} className="text-xs text-slate-500 pl-6">• {test}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Progress Tracker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingTop: '8px', paddingBottom: '8px', borderTop: '1px solid #e2e8f0', overflowX: 'auto' }}>
                    {(() => {
                      const isCheckedIn = ['Checked In', 'Sample Collected', 'Completed'].includes(task.status);
                      const isSampleCollected = ['Sample Collected', 'Completed'].includes(task.status);
                      const isCompleted = task.status === 'Completed';

                      return [
                        { label: 'Confirmed', completed: true },
                        { label: 'Checked In', completed: isCheckedIn },
                        { label: 'Sample\nCollected', completed: isSampleCollected },
                        { label: 'Completed', completed: isCompleted },
                      ].map((step, idx, arr) => (
                        <React.Fragment key={idx}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '48px' }}>
                            <div style={{
                              width: '18px', height: '18px', borderRadius: '50%',
                              backgroundColor: step.completed ? '#10b981' : '#e2e8f0',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              marginBottom: '4px', flexShrink: 0
                            }}>
                              {step.completed && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ width: '10px', height: '10px' }}>
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              )}
                            </div>
                            <span style={{ fontSize: '9px', fontWeight: 700, color: step.completed ? '#10b981' : '#94a3b8', textAlign: 'center', whiteSpace: 'pre-line' }}>
                              {step.label}
                            </span>
                          </div>
                          {idx < arr.length - 1 && (
                            <div style={{ flex: 1, height: '2px', backgroundColor: step.completed ? '#10b981' : '#e2e8f0', marginBottom: '18px', minWidth: '8px' }} />
                          )}
                        </React.Fragment>
                      ));
                    })()}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto pt-4 border-t border-slate-200 flex flex-col gap-2">
                    {task.status === 'Pending' && canEditStatus && (
                      <button
                        disabled={isCheckingIn}
                        onClick={() => handleCheckIn(task.id)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors text-sm"
                      >
                        {isCheckingIn ? 'Checking In...' : 'Check In Patient'}
                      </button>
                    )}
                    {task.status === 'Checked In' && canEditStatus && (
                      <button
                        disabled={isCollecting}
                        onClick={() => handleRecordSampleCollected(task.id)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors text-sm"
                      >
                        {isCollecting ? 'Recording...' : 'Confirm Sample Collected'}
                      </button>
                    )}
                    {(task.status === 'Sample Collected' || task.status === 'Completed') && (
                      <div className="w-full py-2 bg-emerald-50 text-emerald-700 text-center font-bold rounded-lg text-sm border border-emerald-200">
                        ✓ Sample Collected
                      </div>
                    )}
                    {!canEditStatus && !['Sample Collected', 'Completed'].includes(task.status) && (
                      <div className="w-full py-2 bg-slate-100 text-slate-400 text-center text-xs font-semibold rounded-lg">
                        No permission to update status
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && (cursorHistory.length > 0 || nextCursor) && (
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-200">
              <button
                onClick={() => {
                  const newHistory = [...cursorHistory];
                  newHistory.pop();
                  const prevCursor = newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
                  setCursorHistory(newHistory.slice(0, -1));
                  fetchWorkspace(prevCursor, true);
                }}
                disabled={cursorHistory.length === 0 || isLoading}
                className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                ← Previous
              </button>
              <span className="text-sm font-semibold text-slate-500">
                Page {cursorHistory.length + 1}
              </span>
              <button
                onClick={() => fetchWorkspace(nextCursor)}
                disabled={!nextCursor || isLoading}
                className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminPageTemplate>
  );
}
