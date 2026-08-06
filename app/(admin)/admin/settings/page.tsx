'use client';

import React, { useState } from 'react';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { AdminCard } from '@/components/admin/primitives/AdminCard';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');
  
  const tabs = [
    { name: 'General', icon: 'settings' as const },
    { name: 'Notifications', icon: 'bell' as const },
    { name: 'Billing & Payments', icon: 'creditCard' as const },
    { name: 'API Integrations', icon: 'database' as const },
  ];

  return (
    <AdminPageTemplate>
      <div style={{ marginBottom: '40px' }}>
        <AdminCard padding="none" className="overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col md:flex-row min-h-[600px]">
            
            {/* Vertical Tabs */}
            <div className="w-full md:w-[240px] border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col gap-2 bg-slate-50/50">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.name 
                      ? 'bg-white shadow-sm border border-slate-200 text-blue-600' 
                      : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <AdminIcon name={tab.icon} className={`w-[16px] h-[16px] ${activeTab === tab.name ? 'text-blue-600' : 'text-slate-400'}`} strokeWidth={2} />
                  <span className="text-[13px] font-semibold">{tab.name}</span>
                </button>
              ))}
            </div>
            
            {/* Form Area */}
            <div className="flex-1 p-8 lg:p-10 bg-white">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                <div className="text-[14px] font-bold text-slate-800 uppercase tracking-wider">{activeTab} Settings</div>
                <button className="text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg">
                  Save Changes
                </button>
              </div>

              {activeTab === 'General' && (
                <div className="max-w-2xl">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Clinic Name</label>
                        <input type="text" defaultValue="Agam Diagnostics" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-[13px] font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Contact Email</label>
                        <input type="email" defaultValue="admin@agamdiagnostics.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-[13px] font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Primary Address</label>
                      <textarea 
                        defaultValue="14, Medical College Road, Madurai - 625020" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[13px] font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all min-h-[80px] resize-y" 
                      />
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6 border-t border-slate-100 pt-6">
                      <div className="flex-1">
                        <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Currency</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-[13px] font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                          <option>INR (₹)</option>
                          <option>USD ($)</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Timezone</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-[13px] font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                          <option>Asia/Kolkata (IST)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab !== 'General' && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                  <AdminIcon name="settings" className="w-12 h-12 text-slate-200 mb-4" strokeWidth={1.5} />
                  <div className="text-[14px] font-bold text-slate-900 mb-1">{activeTab} Config</div>
                  <p className="text-[12px] font-medium text-slate-500 text-center max-w-xs leading-relaxed">This settings panel is a placeholder for demonstration purposes.</p>
                </div>
              )}
            </div>
            
          </div>
        </AdminCard>
      </div>
    </AdminPageTemplate>
  );
}
