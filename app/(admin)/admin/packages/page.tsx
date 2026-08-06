'use client';

import React from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminCard } from '@/components/admin/primitives/AdminCard';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { packagesData } from '@/data/admin/mockPackages';

export default function PackagesPage() {
  return (
    <AdminPageTemplate>
      <div style={{ marginBottom: '40px' }}>
        <AdminCard padding="none" className="overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-xl border border-slate-200 bg-white">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-slate-900 text-white text-[13px] font-semibold rounded-lg">All Packages</button>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-[13px] font-semibold rounded-lg transition-colors">Preventive</button>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-[13px] font-semibold rounded-lg transition-colors">Specialized</button>
              </div>
              <div className="relative">
                <AdminIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search packages..." 
                  className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all w-[260px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {packagesData.map((pkg) => (
                <div key={pkg.id} className="group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-[0_8px_24px_rgb(0,0,0,0.06)] hover:border-slate-300 transition-all relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{pkg.category}</span>
                    <span className="text-[11px] font-bold text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded">{pkg.id}</span>
                  </div>
                  
                  <h4 className="text-[16px] font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{pkg.name}</h4>
                  
                  <div className="flex items-center gap-1.5 mb-4">
                    <AdminIcon name="testTube" className="w-[14px] h-[14px] text-slate-400" />
                    <span className="text-[12px] font-medium text-slate-500">{pkg.tests} Tests Included</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</span>
                      <span className="text-[16px] font-bold text-slate-900">{pkg.price}</span>
                    </div>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <AdminIcon name="edit" className="w-[14px] h-[14px]" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer min-h-[240px]">
                <AdminIcon name="plus" className="w-8 h-8 mb-3 text-slate-300 group-hover:text-blue-500" strokeWidth={2} />
                <span className="text-[14px] font-bold">Add New Package</span>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminPageTemplate>
  );
}


