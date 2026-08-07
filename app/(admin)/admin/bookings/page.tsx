'use client';

import React, { useState, useEffect } from 'react';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { useToast } from '@/components/admin/feedback/Toast';

// --- MOCK DATA ---
const mockBookings = [
  { id: 'B-1035', name: 'Arjun Reddy', phone: '+91 98765 00001', date: 'Oct 12, 2026', time: '08:00 AM', type: 'Home Collection', status: 'Pending', amount: 1450, tests: ['CBC', 'Lipid Profile'] },
  { id: 'B-1034', name: 'Sneha Patel', phone: '+91 98765 00002', date: 'Oct 12, 2026', time: '09:30 AM', type: 'Lab Visit', status: 'Completed', amount: 890, tests: ['Thyroid Panel'] },
  { id: 'B-1033', name: 'Vikram Singh', phone: '+91 98765 00003', date: 'Oct 12, 2026', time: '11:00 AM', type: 'Home Collection', status: 'Confirmed', amount: 3200, tests: ['Comprehensive Health Check'] },
  { id: 'B-1032', name: 'Pooja Desai', phone: '+91 98765 00004', date: 'Oct 11, 2026', time: '07:15 AM', type: 'Home Collection', status: 'Processing', amount: 2100, tests: ['HbA1c', 'Fasting Blood Sugar'] },
  { id: 'B-1031', name: 'Rohan Sharma', phone: '+91 98765 00005', date: 'Oct 11, 2026', time: '04:00 PM', type: 'Lab Visit', status: 'Cancelled', amount: 550, tests: ['Vitamin D'] },
  { id: 'B-1030', name: 'Kavya Iyer', phone: '+91 98765 00006', date: 'Oct 10, 2026', time: '08:30 AM', type: 'Home Collection', status: 'Completed', amount: 1100, tests: ['Liver Function Test'] },
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
  if (status === 'Cancelled') return { bg: 'rgba(244, 63, 94, 0.15)', text: '#e11d48', dot: '#f43f5e' };
  return { bg: 'rgba(226, 232, 240, 0.5)', text: '#475569', dot: '#94a3b8' };
};

export default function GlassBookingsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const { toast } = useToast();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <AdminPageTemplate>
      {/* MESH GRADIENT BACKGROUND */}
      <div 
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
          background: 'radial-gradient(circle at 10% 20%, rgba(224, 242, 254, 0.6), transparent 40%), radial-gradient(circle at 90% 80%, rgba(167, 243, 208, 0.4), transparent 40%)',
          backgroundColor: '#f8fafc', overflow: 'hidden', pointerEvents: 'none'
        }}
      />

      <div className="admin-page-container" style={{ position: 'relative', zIndex: 1, padding: '40px', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '100%', fontFamily: 'Inter, system-ui, sans-serif', minWidth: 0 }}>
        
        {/* TABS & SEARCH ROW */}
        <div className="admin-responsive-flex-col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Order Management</h1>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', margin: '4px 0 0 0' }}>Track home collections, lab visits, and patient requests.</p>
          </div>
          <button 
            onClick={() => toast({ title: 'New Booking Modal', description: 'This would open the booking creation form.', variant: 'info' })}
            style={{ height: '44px', padding: '0 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}
          >
            <AdminIcon name="plus" style={{ width: '16px', height: '16px' }} /> Create Booking
          </button>
        </div>

        {/* GLASS FILTER BAR */}
        <div style={{ ...glassStyle, padding: '8px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['All', 'Pending', 'Home Collection', 'Lab Visit'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  height: '40px', padding: '0 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 700, transition: 'all 0.2s',
                  backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
                  color: activeTab === tab ? '#0f172a' : '#64748b',
                  boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Search */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <AdminIcon name="search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search ID, patient, or phone..." 
              style={{ width: '100%', height: '40px', padding: '0 16px 0 42px', borderRadius: '10px', border: '1px solid rgba(226, 232, 240, 0.8)', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '14px', color: '#0f172a', outline: 'none' }}
            />
          </div>
        </div>

        {/* GLASS DATA TABLE */}
        <div className="admin-glass-panel admin-table-container" style={{ ...glassStyle, padding: '32px', flex: 1, minWidth: 0 }}>
          
          {/* Table Header */}
          <div className="admin-table-row admin-hide-table-header" style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.5fr 1.5fr 1fr 1fr', padding: '0 24px 16px 24px', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Details</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Schedule</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tests</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Amount</div>
          </div>

          {/* Table Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mockBookings.filter(b => activeTab === 'All' || b.status === activeTab || b.type === activeTab).map((booking) => {
              const statusTheme = getStatusColor(booking.status);
              return (
                <div 
                  key={booking.id}
                  className="admin-table-row admin-mobile-grid-row"
                  style={{ 
                    display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.5fr 1.5fr 1fr 1fr', alignItems: 'center', 
                    backgroundColor: 'rgba(255,255,255,0.5)', padding: '16px 24px', borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.8)', transition: 'background-color 0.2s', cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)'}
                >
                  <div data-label="Order ID" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{booking.id}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: booking.type === 'Home Collection' ? '#3b82f6' : '#8b5cf6', backgroundColor: booking.type === 'Home Collection' ? '#eff6ff' : '#f3e8ff', display: 'inline-flex', padding: '2px 8px', borderRadius: '12px', alignSelf: 'flex-start' }}>{booking.type}</div>
                  </div>
                  
                  <div data-label="Patient Details">
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{booking.name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>{booking.phone}</div>
                  </div>
                  
                  <div data-label="Schedule">
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{booking.date}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>{booking.time}</div>
                  </div>

                  <div data-label="Tests">
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      {booking.tests.map((t, i) => <div key={i}>{t}</div>)}
                    </div>
                  </div>
                  
                  <div data-label="Status">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: statusTheme.bg, padding: '6px 12px', borderRadius: '20px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusTheme.dot }}></span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: statusTheme.text }}>{booking.status}</span>
                    </div>
                  </div>
                  
                  <div data-label="Amount" style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>₹{booking.amount}</div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </AdminPageTemplate>
  );
}
