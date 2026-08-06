'use client';

import React, { useState } from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminCard } from '@/components/admin/primitives/AdminCard';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { testsData } from '@/data/admin/mockTests';

export default function TestsPage() {
  const [expandedDept, setExpandedDept] = useState<string>('Biochemistry');

  return (
    <AdminPageTemplate>
      <div style={{ marginBottom: '40px' }}>
        <AdminCard padding="none" className="overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-xl border border-slate-200 bg-white">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="relative w-full md:w-[320px]">
                <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search tests by name or code..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <button className="text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 px-4 py-2.5 rounded-lg shrink-0">
                <AdminIcon name="plus" className="w-[16px] h-[16px]" strokeWidth={2} />
                Add New Test
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {testsData.map((categoryGroup) => (
                <div key={categoryGroup.category} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {/* Department Header */}
                  <button 
                    onClick={() => setExpandedDept(expandedDept === categoryGroup.category ? '' : categoryGroup.category)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <AdminIcon name="testTube" className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-[14px] font-bold text-slate-800">{categoryGroup.category}</div>
                        <div className="text-[12px] text-slate-500 font-medium">{categoryGroup.tests.length} active tests</div>
                      </div>
                    </div>
                    <AdminIcon 
                      name="chevronDown" 
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${expandedDept === categoryGroup.category ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  
                  {/* Tests List */}
                  {expandedDept === categoryGroup.category && (
                    <div className="divide-y divide-slate-100 border-t border-slate-200">
                      {categoryGroup.tests.map((test) => (
                        <div key={test.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] font-bold text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{test.code}</span>
                              <div className="text-[13px] font-bold text-slate-900">{test.name}</div>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-[12px] text-slate-500 flex items-center gap-1.5">
                                <AdminIcon name="clock" className="w-3.5 h-3.5" /> TAT: {test.turnaround}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between md:justify-end gap-6 md:w-[200px]">
                            <div className="flex flex-col md:text-right">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Price</span>
                              <span className="text-[14px] font-bold text-slate-900">{test.price}</span>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <AdminIcon name="edit" className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminPageTemplate>
  );
}
