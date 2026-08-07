'use client';

import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState(navItems[0].id);
  const { toast } = useToast();

  return (
    <AdminPageTemplate>
      <div 
        style={{ 
          maxWidth: '1600px', 
          width: '100%',
          margin: '0 auto', 
          padding: '32px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          minHeight: '100%',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
      >
        {/* TOP HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '24px 32px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Platform Configuration</h1>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', margin: '4px 0 0 0' }}>Manage clinical standards, equipment integrations, and communication rules.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
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
        <div className="admin-responsive-grid-2col" style={{ display: 'flex', gap: '32px', flex: 1, minHeight: '700px' }}>
          
          {/* LEFT: SETTINGS NAVIGATION */}
          <div style={{ width: '380px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              
              return (
                <div 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    padding: '20px',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    borderRadius: '16px',
                    border: `1px solid ${isActive ? '#bfdbfe' : 'transparent'}`,
                    boxShadow: isActive ? '0 10px 25px -5px rgba(59, 130, 246, 0.1)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc' }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  {isActive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#3b82f6' }} />}
                  
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: isActive ? '#eff6ff' : '#f1f5f9', color: isActive ? '#2563eb' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
          <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {activeTab === 'profile' && (
              <>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Lab Profile & Compliance</h2>
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Manage organizational identity and clinical accreditations.</p>
                </div>

                <div className="admin-responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>Facility Name</label>
                    <input type="text" defaultValue="Agam Diagnostics Center" style={{ height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: '#0f172a', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>NABL Accreditation Number</label>
                    <input type="text" defaultValue="MC-2938475" style={{ height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: '#0f172a', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>Registered Address</label>
                  <textarea defaultValue="124 Health Avenue, Medical District, Suite 400" style={{ height: '80px', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: '#0f172a', outline: 'none', resize: 'none' }} />
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>Default Pathologist Signature</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '24px', borderRadius: '16px', border: '2px dashed #cbd5e1', backgroundColor: '#f8fafc' }}>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

                  <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>Hospital Information System (HIS) Sync</h3>
                  <div className="admin-responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>HIS Endpoint URL</label>
                      <input type="text" defaultValue="https://api.agam-his.local/v1/sync" style={{ height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: '#0f172a', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>Sync Frequency</label>
                      <select style={{ height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: '#0f172a', outline: 'none', backgroundColor: '#fff' }}>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Highlight Abnormal Values</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Values outside reference ranges will be printed in bold red.</div>
                    </div>
                    <div onClick={() => toast({ title: 'Setting Updated', variant: 'success' })} style={{ width: '48px', height: '28px', backgroundColor: '#10b981', borderRadius: '14px', position: 'relative', cursor: 'pointer' }}>
                      <div style={{ width: '22px', height: '22px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: '23px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </div>

                  <div style={{ padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Print Patient QR Code</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Add a scannable verification QR code to the footer of every report.</div>
                    </div>
                    <div onClick={() => toast({ title: 'Setting Updated', variant: 'success' })} style={{ width: '48px', height: '28px', backgroundColor: '#10b981', borderRadius: '14px', position: 'relative', cursor: 'pointer' }}>
                      <div style={{ width: '22px', height: '22px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: '23px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </div>

                  <div style={{ padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Include Methodology Notes</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Append testing methodologies (e.g., CLIA, HPLC) below each parameter.</div>
                    </div>
                    <div onClick={() => toast({ title: 'Setting Updated', variant: 'success' })} style={{ width: '48px', height: '28px', backgroundColor: '#e2e8f0', borderRadius: '14px', position: 'relative', cursor: 'pointer' }}>
                      <div style={{ width: '22px', height: '22px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: '3px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>Report Header Margin (mm)</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <input type="number" defaultValue={45} style={{ width: '100px', height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: 800, color: '#0f172a', outline: 'none' }} />
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                  <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Pre-Test Fasting Reminders</div>
                      <div onClick={() => toast({ title: 'Setting Updated', variant: 'success' })} style={{ width: '48px', height: '28px', backgroundColor: '#10b981', borderRadius: '14px', position: 'relative', cursor: 'pointer' }}>
                        <div style={{ width: '22px', height: '22px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: '23px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                      </div>
                    </div>
                    <textarea 
                      defaultValue="Dear {patient_name}, reminder for your test tomorrow. Please maintain {fasting_hours} hours fasting. - Agam Diagnostics" 
                      style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#475569', outline: 'none', resize: 'none' }} 
                    />
                  </div>

                  <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>WhatsApp Report Delivery</div>
                      <div onClick={() => toast({ title: 'Setting Updated', variant: 'success' })} style={{ width: '48px', height: '28px', backgroundColor: '#10b981', borderRadius: '14px', position: 'relative', cursor: 'pointer' }}>
                        <div style={{ width: '22px', height: '22px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: '23px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                      </div>
                    </div>
                    <textarea 
                      defaultValue="Hello {patient_name}, your clinical reports are ready. Click here to download securely: {report_link}" 
                      style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#475569', outline: 'none', resize: 'none' }} 
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
