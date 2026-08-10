'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { bookingService, alertService, activityService, analyticsService } from '@/services';
import { BookingModel } from '@/domains/booking/model';
import { ActivityRecordModel } from '@/domains/activity/model';

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

  const [recentBookings, setRecentBookings] = useState<BookingModel[]>([]);
  const [operationalAlerts, setOperationalAlerts] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityRecordModel[]>([]);
  const [kpis, setKpis] = useState({ bookingsToday: 0, pendingBookings: 0, homeCollections: 0, revenueToday: 0 });

  useEffect(() => {
    setMounted(true);
    
    const loadDashboardData = async () => {
      const [bookingsRes, alertsRes, activityRes, kpisRes] = await Promise.all([
        bookingService.getRecent(4),
        alertService.getOperationalAlerts(),
        activityService.getAll(),
        analyticsService.getDashboardKPIs()
      ]);

      if (bookingsRes.isSuccess) setRecentBookings(bookingsRes.value);
      setOperationalAlerts(alertsRes); // alertsRes is array directly
      if (activityRes.isSuccess) setActivityFeed(activityRes.value);
      setKpis(kpisRes);
    };

    loadDashboardData();
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

      <div className="admin-page-container relative z-10 p-4 lg:p-10 w-full max-w-[1600px] mx-auto flex flex-col gap-4 lg:gap-8 min-h-full min-w-0" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* HEADER */}
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Good Morning, Admin</h1>
          <p style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', margin: '4px 0 0 0' }}>Here is what's happening at your diagnostic center today.</p>
        </div>

        {/* GLASS KPI CARDS */}
        <div className="admin-responsive-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[
            { label: "Today's Bookings", value: kpis.bookingsToday.toString(), icon: 'calendar', trend: '+12%', color: '#3b82f6' },
            { label: "Pending Tests", value: kpis.pendingBookings.toString(), icon: 'clock', trend: '-2%', color: '#f59e0b' },
            { label: "Home Collections", value: kpis.homeCollections.toString(), icon: 'mapPin', trend: '+4%', color: '#10b981' },
            { label: "Revenue Today", value: `₹${kpis.revenueToday.toLocaleString()}`, icon: 'creditCard', trend: '+8%', color: '#8b5cf6' }
          ].map((kpi, i) => (
            <div
              key={i}
              className="admin-glass-panel"
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
        <div className="admin-quick-actions flex flex-col sm:flex-row flex-wrap gap-3 lg:gap-4">
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
                flex: 1, minWidth: '200px', height: '48px', borderRadius: '16px', border: 'none', background: action.bg, color: '#ffffff',
                fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: '10px',
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
        <div className="admin-responsive-grid-2col grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">

          {/* RECENT BOOKINGS GLASS TABLE */}
          <div className="admin-glass-panel p-4 lg:p-8 flex flex-col gap-4 lg:gap-6 min-w-0" style={glassStyle}>
            <div className="flex justify-between items-center">
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Recent Bookings</h2>
              <button onClick={() => router.push('/admin/bookings')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <AdminIcon name="chevronRight" style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            <div className="admin-table-container flex flex-col gap-3">
              {recentBookings.map((booking) => {
                const statusTheme = getStatusColor(booking.status);
                return (
                  <div
                    key={booking.id}
                    className="admin-table-row admin-mobile-grid-row grid lg:grid-cols-[1fr_2fr_1fr_1fr_1fr] items-center p-4 lg:px-5 lg:py-4 rounded-2xl cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(255,255,255,0.8)', transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)'}
                  >
                    <div data-label="Order ID" style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{booking.id}</div>
                    <div data-label="Patient">
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{booking.patient.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>{booking.collection.type}</div>
                    </div>
                    <div data-label="Date & Time" style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{booking.collection.date}</div>
                    <div data-label="Status">
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: statusTheme.bg, padding: '4px 10px', borderRadius: '20px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusTheme.dot }}></span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: statusTheme.text }}>{booking.status}</span>
                      </div>
                    </div>
                    <div data-label="Amount" style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>₹{booking.payment.total}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANELS: ALERTS & ACTIVITY */}
          <div className="flex flex-col gap-6 min-w-0">

            {/* ALERTS */}
            <div className="admin-glass-panel p-4 lg:p-6 min-w-0" style={glassStyle}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px 0' }}>Operational Alerts</h2>
              <div className="flex flex-col gap-4">
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
            <div className="admin-glass-panel p-4 lg:p-6 flex-1 min-w-0" style={glassStyle}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px 0' }}>Activity Feed</h2>
              <div className="flex flex-col gap-5">
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
