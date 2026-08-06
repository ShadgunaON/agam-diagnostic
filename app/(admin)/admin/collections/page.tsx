'use client';

import React from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminCard } from '@/components/admin/primitives/AdminCard';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { collectionsData } from '@/data/admin/mockCollections';

export default function CollectionsPage() {
  return (
    <AdminPageTemplate>
      <div style={{ marginBottom: '40px' }}>
        <AdminCard padding="none" className="overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col lg:flex-row h-full min-h-[700px]">
            
            {/* Left Sidebar - Task List */}
            <div className="w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col bg-white">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                <div className="text-[14px] font-bold text-slate-800 mb-3">Today's Schedule</div>
                <div className="relative">
                  <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search patient or area..." 
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {collectionsData.map((task, idx) => (
                  <div key={task.id} className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${idx === 0 ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-[14px] font-bold text-slate-900">{task.time}</div>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">{task.id}</span>
                    </div>
                    <div className="text-[13px] font-semibold text-slate-800 mb-1 leading-tight">{task.patient}</div>
                    <div className="text-[12px] font-medium text-slate-500 flex items-start gap-1.5 mb-3">
                      <AdminIcon name="mapPin" className="w-[14px] h-[14px] shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-snug">{task.address}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                          {task.phlebotomist && task.phlebotomist !== 'Pending' ? task.phlebotomist.charAt(0) : '?'}
                        </div>
                        <span className="text-[12px] font-semibold text-slate-700">
                          {task.phlebotomist === 'Pending' ? 'Unassigned' : task.phlebotomist}
                        </span>
                      </div>
                      <span className={`text-[11px] font-bold ${
                        task.status === 'Completed' ? 'text-emerald-600' :
                        task.status === 'In Progress' ? 'text-blue-600' :
                        'text-rose-600'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Side - Map Placeholder */}
            <div className="flex-1 bg-slate-50/50 relative min-h-[400px] lg:min-h-0 flex flex-col items-center justify-center p-8">
              {/* Decorative grid pattern */}
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.3 }} />
              
              <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
                  <AdminIcon name="mapPin" className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                </div>
                <div className="text-[16px] font-bold text-slate-900 mb-2">Live Dispatch Map</div>
                <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-6">
                  Select a task from the dispatch list to view its precise location, assign a phlebotomist, or track live status.
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Completed</div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" />Active</div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" />Unassigned</div>
                </div>
              </div>
            </div>
            
          </div>
        </AdminCard>
      </div>
    </AdminPageTemplate>
  );
}
