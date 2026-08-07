'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';

// --- MOCK DATA ---
const recentBookings = [
  { id: 'B-1029', name: 'Rahul Sharma', date: 'Oct 12, 2026', type: 'Home Collection', status: 'Pending', amount: 1299 },
  { id: 'B-1028', name: 'Priya Patel', date: 'Oct 12, 2026', type: 'Lab Visit', status: 'Completed', amount: 499 },
  { id: 'B-1027', name: 'Anil Kumar', date: 'Oct 11, 2026', type: 'Home Collection', status: 'Processing', amount: 2450 },
  { id: 'B-1026', name: 'Meera Reddy', date: 'Oct 11, 2026', type: 'Lab Visit', status: 'Confirmed', amount: 899 },
];

const operationalAlerts = [
  { id: '1', message: '3 reports overdue by more than 24 hours', severity: 'danger', time: '2h ago' },
  { id: '2', message: '5 home collections unassigned for tomorrow', severity: 'warning', time: '1h ago' },
  { id: '3', message: '2 payments pending verification', severity: 'info', time: '45m ago' },
];

const activityFeed = [
  { id: '1', user: 'System', action: 'New home collection (B-1030)', time: 'Just now' },
  { id: '2', user: 'Dr. Sarah', action: 'Uploaded pathology report', time: '10 mins ago' },
  { id: '3', user: 'Admin Staff', action: 'Assigned Phlebotomist', time: '1 hour ago' },
];

// --- STYLES ---
const glassStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
  borderRadius: '24px',
};

const getStatusColor = (status: string) => {
  if (status === 'Completed' || status === 'Confirmed') return { bg: 'rgba(16, 185, 129, 0.15)', text: '#059669', dot: '#10b981' };
  if (status === 'Pending' || status === 'Processing') return { bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706', dot: '#f59e0b' };
  return { bg: 'rgba(226, 232, 240, 0.5)', text: '#475569', dot: '#94a3b8' };
};

export default function GlassDashboard() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AdminPageTemplate>
      {/* MESH GRADIENT BACKGROUND */}
      <div 
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
          background: 'radial-gradient(circle at 15% 50%, rgba(224, 242, 254, 0.5), transparent 25%), radial-gradient(circle at 85% 30%, rgba(233, 213, 255, 0.5), transparent 25%)',
          backgroundColor: '#f8fafc',
          overflow: 'hidden', pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, padding: '40px', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '100%', fontFamily: 'Inter, system-ui, sans-serif' }}>
        
        {/* HEADER */}
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Good Morning, Admin</h1>
          <p style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', margin: '4px 0 0 0' }}>Here is what's happening at your diagnostic center today.</p>
        </div>

        {/* GLASS KPI CARDS */}
        <div className="admin-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {[
            { label: "Today's Bookings", value: '24', icon: 'calendar', trend: '+12%', color: '#3b82f6' },
            { label: "Pending Tests", value: '6', icon: 'clock', trend: '-2%', color: '#f59e0b' },
            { label: "Home Collections", value: '12', icon: 'mapPin', trend: '+4%', color: '#10b981' },
            { label: "Revenue Today", value: '₹18,450', icon: 'creditCard', trend: '+8%', color: '#8b5cf6' }
          ].map((kpi, i) => (
            <div 
              key={i} 
              style={{
                ...glassStyle, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px -5px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = glassStyle.boxShadow;
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: `rgba(255,255,255, 0.8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <AdminIcon name={kpi.icon as any} style={{ width: '22px', height: '22px' }} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: kpi.trend.startsWith('+') ? '#10b981' : '#f43f5e', backgroundColor: 'rgba(255,255,255,0.7)', padding: '4px 10px', borderRadius: '20px' }}>
                  {kpi.trend}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{kpi.value}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginTop: '4px' }}>{kpi.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS (FLOATING PILLS) */}
        <div className="admin-quick-actions" style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'New Booking', icon: 'plus', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', href: '/admin/bookings' },
            { label: 'Upload Report', icon: 'fileText', bg: 'linear-gradient(135deg, #10b981, #059669)', href: '/admin/reports' },
            { label: 'Add Patient', icon: 'users', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', href: '/admin/patients' },
            { label: 'View Schedule', icon: 'calendar', bg: 'linear-gradient(135deg, #f59e0b, #d97706)', href: '/admin/collections' }
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => router.push(action.href)}
              style={{
                flex: 1, height: '48px', borderRadius: '16px', border: 'none', background: action.bg, color: '#ffffff',
                fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)', pointerEvents: 'none' }} />
              <AdminIcon name={action.icon as any} style={{ width: '16px', height: '16px', position: 'relative', zIndex: 1 }} />
              <span style={{ position: 'relative', zIndex: 1 }}>{action.label}</span>
            </button>
          ))}
        </div>

        {/* BOTTOM SECTIONS */}
        <div className="admin-responsive-grid-2col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          {/* RECENT BOOKINGS GLASS TABLE */}
          <div style={{ ...glassStyle, padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Recent Bookings</h2>
              <button onClick={() => router.push('/admin/bookings')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <AdminIcon name="chevronRight" style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
            
            <div className="admin-table-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentBookings.map((booking) => {
                const statusTheme = getStatusColor(booking.status);
                return (
                  <div 
                    key={booking.id}
                    className="admin-table-row"
                    style={{ 
                      display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', alignItems: 'center', 
                      backgroundColor: 'rgba(255,255,255,0.5)', padding: '16px 20px', borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.8)', transition: 'background-color 0.2s', cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)'}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{booking.id}</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{booking.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>{booking.type}</div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{booking.date}</div>
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: statusTheme.bg, padding: '4px 10px', borderRadius: '20px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusTheme.dot }}></span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: statusTheme.text }}>{booking.status}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>₹{booking.amount}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANELS: ALERTS & ACTIVITY */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* ALERTS */}
            <div style={{ ...glassStyle, padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px 0' }}>Operational Alerts</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {operationalAlerts.map(alert => (
                  <div key={alert.id} style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: alert.severity === 'danger' ? 'rgba(244,63,94,0.1)' : alert.severity === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)', color: alert.severity === 'danger' ? '#f43f5e' : alert.severity === 'warning' ? '#f59e0b' : '#3b82f6' }}>
                      <AdminIcon name="alertTriangle" style={{ width: '18px', height: '18px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>{alert.message}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginTop: '4px' }}>{alert.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIVITY FEED */}
            <div style={{ ...glassStyle, padding: '24px', flex: 1 }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px 0' }}>Activity Feed</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activityFeed.map((activity, i) => (
                  <div key={activity.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                    {i !== activityFeed.length - 1 && <div style={{ position: 'absolute', top: '32px', left: '15px', bottom: '-20px', width: '2px', backgroundColor: 'rgba(226,232,240,0.5)' }} />}
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, backgroundColor: '#ffffff', border: '2px solid rgba(226,232,240,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      <AdminIcon name="user" style={{ width: '14px', height: '14px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>{activity.user}</span> {activity.action}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginTop: '2px' }}>{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </AdminPageTemplate>
  );
}
