'use client';

import React, { useState, useEffect } from 'react';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { useToast } from '@/components/admin/feedback/Toast';

// --- STYLES ---
const glassStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
  borderRadius: '24px',
};

export default function GlassProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('Personal Details');
  const { toast } = useToast();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <AdminPageTemplate>
      {/* MESH GRADIENT BACKGROUND */}
      <div 
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(224, 242, 254, 0.6), transparent 40%), radial-gradient(circle at 100% 100%, rgba(167, 243, 208, 0.4), transparent 40%)',
          backgroundColor: '#f8fafc', overflow: 'hidden', pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '100%', fontFamily: 'Inter, system-ui, sans-serif' }}>
        
        {/* HEADER */}
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>My Profile</h1>
          <p style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', margin: '4px 0 0 0' }}>Manage your personal details and security preferences.</p>
        </div>

        {/* PROFILE HERO CARD */}
        <div style={{ ...glassStyle, padding: '40px', display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '24px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '32px', fontWeight: 900, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            AS
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Admin Staff</h2>
            <p style={{ fontSize: '15px', color: '#64748b', fontWeight: 600, margin: '0 0 16px 0' }}>System Manager • Joined August 2024</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => toast({ title: 'Photo Upload', description: 'Select an image file.', variant: 'info' })} style={{ padding: '8px 20px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Upload New Photo</button>
              <button onClick={() => toast({ title: 'Photo Removed', variant: 'success' })} style={{ padding: '8px 20px', borderRadius: '10px', backgroundColor: 'transparent', color: '#f43f5e', fontSize: '13px', fontWeight: 700, border: '1px solid rgba(244, 63, 94, 0.3)', cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        </div>

        <div className="admin-responsive-grid-2col" style={{ display: 'flex', gap: '32px' }}>
          {/* LEFT: NAV */}
          <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Personal Details', 'Security & Password', 'Notifications'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  height: '52px', padding: '0 20px', borderRadius: '16px', cursor: 'pointer',
                  fontSize: '15px', fontWeight: 700, textAlign: 'left', transition: 'all 0.2s',
                  backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
                  color: activeTab === tab ? '#0f172a' : '#64748b',
                  boxShadow: activeTab === tab ? '0 4px 15px rgba(0,0,0,0.03)' : 'none',
                  border: activeTab === tab ? '1px solid rgba(255,255,255,0.8)' : '1px solid transparent'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* RIGHT: CONTENT */}
          <div style={{ ...glassStyle, padding: '40px', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {activeTab === 'Personal Details' && (
              <>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, paddingBottom: '20px', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>Basic Information</h3>
                
                <div className="admin-responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>First Name</label>
                    <input type="text" defaultValue="Admin" style={{ height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 600, color: '#0f172a', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>Last Name</label>
                    <input type="text" defaultValue="Staff" style={{ height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 600, color: '#0f172a', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>Email Address</label>
                    <input type="email" defaultValue="admin@agam.com" style={{ height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 600, color: '#0f172a', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>Phone Number</label>
                    <input type="tel" defaultValue="+91 98765 12345" style={{ height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 600, color: '#0f172a', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
                  <button onClick={() => toast({ title: 'Profile Updated', description: 'Your personal details have been saved.', variant: 'success' })} style={{ height: '48px', padding: '0 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}>Save Changes</button>
                </div>
              </>
            )}

            {activeTab === 'Security & Password' && (
              <>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, paddingBottom: '20px', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>Change Password</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>Current Password</label>
                    <input type="password" style={{ height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '14px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>New Password</label>
                    <input type="password" style={{ height: '48px', padding: '0 16px', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
                  <button onClick={() => toast({ title: 'Password Updated', description: 'Your security password has been changed.', variant: 'success' })} style={{ height: '48px', padding: '0 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0f172a, #334155)', color: '#ffffff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.15)' }}>Update Password</button>
                </div>
              </>
            )}

            {activeTab === 'Notifications' && (
              <>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, paddingBottom: '20px', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>Alert Preferences</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Email Notifications</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Receive daily summaries and critical alerts.</div>
                    </div>
                    <div onClick={() => toast({ title: 'Preference Updated', variant: 'success' })} style={{ width: '48px', height: '28px', backgroundColor: '#10b981', borderRadius: '14px', position: 'relative', cursor: 'pointer' }}>
                      <div style={{ width: '22px', height: '22px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: '23px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>SMS Alerts</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Receive urgent SMS for critical path reports.</div>
                    </div>
                    <div onClick={() => toast({ title: 'Preference Updated', variant: 'success' })} style={{ width: '48px', height: '28px', backgroundColor: 'rgba(226, 232, 240, 0.8)', borderRadius: '14px', position: 'relative', cursor: 'pointer' }}>
                      <div style={{ width: '22px', height: '22px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: '3px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                    </div>
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
