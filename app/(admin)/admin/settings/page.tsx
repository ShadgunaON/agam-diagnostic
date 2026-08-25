'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { useToast } from '@/components/admin/feedback/Toast';

const navItems = [
  { id: 'profile', title: 'Lab Profile & Compliance', icon: 'building', desc: 'Accreditations & signatures' },
  { id: 'equipment', title: 'Equipment & Integrations', icon: 'flask', desc: 'LIS & machine interfacing' },
  { id: 'reports', title: 'Report Formatting', icon: 'fileText', desc: 'PDF layouts & branding' },
  { id: 'comms', title: 'Patient Communications', icon: 'messageSquare', desc: 'SMS alerts & delivery rules' },
];

export default function DiagnosticsSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(navItems[0].id);
  const { toast } = useToast();

  useEffect(() => {
    // Redirect away from unfinished settings experience
    router.replace('/admin');
  }, [router]);

  return (
    <AdminPageTemplate>
      <div 
        className="admin-page-container w-full max-w-[1600px] mx-auto p-4 lg:p-8 xl:p-10 flex flex-col gap-4 lg:gap-8 min-h-full"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 lg:p-6 xl:p-8 rounded-[20px] border border-slate-200 shadow-sm gap-4 md:gap-0">
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Platform Configuration</h1>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', margin: '4px 0 0 0' }}>Manage clinical standards, equipment integrations, and communication rules.</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button 
              onClick={() => toast({ title: 'Changes Discarded', variant: 'info' })}
              style={{ 
                height: '44px', padding: '0 24px', borderRadius: '12px', border: '1px solid #e2e8f0', 
                backgroundColor: '#ffffff', color: '#475569', 
                fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              Cancel Changes
            </button>
            <button 
              onClick={() => toast({ title: 'Configuration Saved', description: 'Your platform settings have been updated.', variant: 'success' })}
              style={{ 
                height: '44px', padding: '0 24px', borderRadius: '12px', border: 'none', 
                backgroundColor: '#0f172a', color: '#ffffff', 
                fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)', transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <AdminIcon name="check" style={{ width: '18px', height: '18px' }} />
              Save Configuration
            </button>
          </div>
        </div>

        {/* SPLIT DASHBOARD LAYOUT */}
        <div className="admin-responsive-flex-col flex flex-col lg:flex-row gap-8 flex-1 min-h-[700px]">
          
          {/* LEFT: SETTINGS NAVIGATION */}
          <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-3">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              
              return (
                <div 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="p-4 lg:p-5 rounded-2xl cursor-pointer relative overflow-hidden flex items-center gap-4 transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    border: `1px solid ${isActive ? '#bfdbfe' : 'transparent'}`,
                    boxShadow: isActive ? '0 10px 25px -5px rgba(59, 130, 246, 0.1)' : 'none',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
                  
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: isActive ? '#eff6ff' : '#f1f5f9', color: isActive ? '#2563eb' : '#64748b' }}>
                    <AdminIcon name={item.icon as any} style={{ width: '20px', height: '20px' }} />
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: isActive ? '#0f172a' : '#475569', marginBottom: '2px' }}>{item.title}</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: CONFIGURATION PANELS */}
          <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-4 md:p-6 lg:p-8 xl:p-10 shadow-sm flex flex-col gap-8 lg:gap-10">
            
            {activeTab === 'profile' && (
              <>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Lab Profile & Compliance</h2>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Manage organizational identity and clinical accreditations.</p>
                </div>

                <div className="admin-responsive-grid grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
                  <div className="flex flex-col gap-2">
                    <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>Facility Name</label>
                    <input type="text" defaultValue="Agam Diagnostics Center" className="h-12 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 outline-none w-full" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>NABL Accreditation Number</label>
                    <input type="text" defaultValue="MC-2938475" className="h-12 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 outline-none w-full" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>Registered Address</label>
                  <textarea defaultValue="124 Health Avenue, Medical District, Suite 400" className="h-20 p-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 outline-none resize-none w-full" />
                </div>

                <div className="border-t border-slate-200 pt-8">
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>Default Pathologist Signature</h3>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
                    <div style={{ width: '120px', height: '60px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'cursive', color: '#1e3a8a', fontSize: '18px' }}>Dr. Smith</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>dr_smith_signature.png</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>PNG, 2.4 MB</div>
                      <button onClick={() => toast({ title: 'File Dialog Opened', description: 'Select a PNG file to upload.', variant: 'info' })} style={{ marginTop: '12px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Upload New Signature</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'equipment' && (
              <>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Equipment & Integrations</h2>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Configure LIS bridging and automated analyzer connections.</p>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="p-4 lg:p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <AdminIcon name="activity" style={{ width: '24px', height: '24px' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Sysmex XN-1000 Hematology</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>HL7 Bi-directional • COM Port 4</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>Connected & Listening</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => toast({ title: 'Opening Configuration', variant: 'info' })} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 700, color: '#475569', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Configure</button>
                  </div>

                  <div className="p-4 lg:p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <AdminIcon name="flask" style={{ width: '24px', height: '24px' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Roche Cobas 6000</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>ASTM Protocol • TCP/IP 192.168.1.50</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626' }}></span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626' }}>Connection Failed</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => toast({ title: 'Connection Failed', description: 'Unable to reach Roche Cobas 6000 on 192.168.1.50', variant: 'danger' })} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 700, color: '#475569', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Reconnect</button>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-8">
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>Hospital Information System (HIS) Sync</h3>
                  <div className="admin-responsive-grid grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div className="flex flex-col gap-2">
                      <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>HIS Endpoint URL</label>
                      <input type="text" defaultValue="https://api.agam-his.local/v1/sync" className="h-12 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 outline-none w-full" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>Sync Frequency</label>
                      <select className="h-12 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 outline-none bg-white w-full">
                        <option>Real-time (Webhooks)</option>
                        <option>Every 15 Minutes</option>
                        <option>Hourly Batch</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'reports' && (
              <>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Report Formatting</h2>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Design how clinical reports are presented to patients and doctors.</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="p-4 lg:p-5 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Highlight Abnormal Values</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Values outside reference ranges will be printed in bold red.</div>
                    </div>
                    <div onClick={() => toast({ title: 'Setting Updated', variant: 'success' })} className="w-12 h-7 bg-emerald-500 rounded-full relative cursor-pointer shrink-0">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-[3px] left-[23px] shadow"></div>
                    </div>
                  </div>

                  <div className="p-4 lg:p-5 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Print Patient QR Code</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Add a scannable verification QR code to the footer of every report.</div>
                    </div>
                    <div onClick={() => toast({ title: 'Setting Updated', variant: 'success' })} className="w-12 h-7 bg-emerald-500 rounded-full relative cursor-pointer shrink-0">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-[3px] left-[23px] shadow"></div>
                    </div>
                  </div>

                  <div className="p-4 lg:p-5 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Include Methodology Notes</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Append testing methodologies (e.g., CLIA, HPLC) below each parameter.</div>
                    </div>
                    <div onClick={() => toast({ title: 'Setting Updated', variant: 'success' })} className="w-12 h-7 bg-slate-200 rounded-full relative cursor-pointer shrink-0">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-[3px] left-[3px] shadow"></div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-8">
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>Report Header Margin (mm)</h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <input type="number" defaultValue={45} className="w-24 h-12 px-4 rounded-xl border border-slate-300 text-base font-extrabold text-slate-900 outline-none" />
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Leave space for pre-printed letterheads.</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'comms' && (
              <>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Patient Communications</h2>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Automated triggers for SMS, WhatsApp, and Email alerts.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="p-4 lg:p-6 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Pre-Test Fasting Reminders</div>
                      <div onClick={() => toast({ title: 'Setting Updated', variant: 'success' })} className="w-12 h-7 bg-emerald-500 rounded-full relative cursor-pointer shrink-0">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-[3px] left-[23px] shadow"></div>
                      </div>
                    </div>
                    <textarea 
                      defaultValue="Dear {patient_name}, reminder for your test tomorrow. Please maintain {fasting_hours} hours fasting. - Agam Diagnostics" 
                      className="w-full h-20 p-3 rounded-lg border border-slate-300 text-[13px] text-slate-600 outline-none resize-none" 
                    />
                  </div>

                  <div className="p-4 lg:p-6 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>WhatsApp Report Delivery</div>
                      <div onClick={() => toast({ title: 'Setting Updated', variant: 'success' })} className="w-12 h-7 bg-emerald-500 rounded-full relative cursor-pointer shrink-0">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-[3px] left-[23px] shadow"></div>
                      </div>
                    </div>
                    <textarea 
                      defaultValue="Hello {patient_name}, your clinical reports are ready. Click here to download securely: {report_link}" 
                      className="w-full h-20 p-3 rounded-lg border border-slate-300 text-[13px] text-slate-600 outline-none resize-none" 
                    />
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
