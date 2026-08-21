'use client';

import React, { useState, useEffect } from 'react';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';

import { bookingService } from '@/services';
import { BookingModel } from '@/domains/booking/model';
import { useRBAC } from '@/hooks/useRBAC';
import { useAuth } from '@/context/AuthContext';

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
  const [sortKey, setSortKey] = useState('date_newest');
  const [bookings, setBookings] = useState<BookingModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { scope, isAdmin } = useRBAC();
  const { user } = useAuth();

  useEffect(() => { 
    setMounted(true); 
    const loadBookings = async () => {
      const result = await bookingService.getAll();
      if (result.isSuccess) {
        setBookings(result.value);
      }
    };
    loadBookings();
  }, []);
  
  if (!mounted) return null;

  const filteredBookings = (bookings || []).filter(b => {
    if (!b) return false;
    if (isAdmin || !scope) return true;
    if (scope === 'home_collection') {
      if (b.collection?.type !== 'Home Collection') return false;
      return b.collection?.assignedPhlebotomist === user?.fullName;
    }
    return true;
  });

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

      <div className="admin-page-container flex flex-col p-4 lg:p-10 mx-auto w-full gap-4 lg:gap-8 min-h-full" style={{ position: 'relative', zIndex: 1, maxWidth: '1600px', fontFamily: 'Inter, system-ui, sans-serif', minWidth: 0 }}>
        
        {/* TABS & SEARCH ROW */}
        <div className="admin-responsive-flex-col flex flex-col lg:flex-row justify-between items-start lg:items-center mb-2 gap-4 w-full">
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Order Management</h1>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', margin: '4px 0 0 0' }}>Track home collections, lab visits, and patient requests.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/admin/bookings/create'}
            className="flex items-center gap-2 px-6 h-11 rounded-xl border-none text-white text-sm font-bold cursor-pointer w-full lg:w-auto justify-center lg:justify-start"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}
          >
            <AdminIcon name="plus" style={{ width: '16px', height: '16px' }} /> Create Booking
          </button>
        </div>

        {/* GLASS FILTER BAR */}
        <div className="flex flex-col lg:flex-row flex-wrap justify-between lg:items-center gap-4 p-2 rounded-2xl w-full" style={{ ...glassStyle }}>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
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
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="h-10 px-4 rounded-lg border border-slate-200/80 bg-white/50 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-auto"
            >
              <option value="date_oldest">Date (Oldest First)</option>
              <option value="date_newest">Date (Newest First)</option>
              <option value="amount_high">Amount (High to Low)</option>
              <option value="amount_low">Amount (Low to High)</option>
            </select>
            <div className="relative w-full sm:w-[260px] lg:w-[320px]">
              <AdminIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search ID, patient, or phone..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-11 pr-4 rounded-lg border border-slate-200/80 bg-white/50 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* GLASS DATA TABLE */}
        <div className="admin-glass-panel admin-table-container flex-1 min-w-0 p-4 lg:p-8" style={{ ...glassStyle }}>
          
          {/* Table Header */}
          <div className="admin-table-row admin-hide-table-header grid grid-cols-[1.2fr_2fr_1.5fr_1.5fr_1fr_1fr] px-4 lg:px-6 pb-4 mb-4 border-b border-slate-200/80">
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Details</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Schedule</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tests</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Amount</div>
          </div>

          {/* Table Rows */}
          <div className="flex flex-col gap-3">
            {filteredBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
                <p style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0', color: '#334155' }}>No bookings found</p>
                <p style={{ fontSize: '13px', margin: 0 }}>There are currently no active bookings matching this filter.</p>
              </div>
            ) : (
              filteredBookings
                .filter(b => activeTab === 'All' || b.status === activeTab || b.collection?.type === activeTab)
                .filter(b => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (b.id || '').toLowerCase().includes(query) || 
                         (b.patient?.name || '').toLowerCase().includes(query) || 
                         (b.patient?.phone || '').includes(query);
                })
                .sort((a, b) => {
                  if (sortKey === 'date_newest') {
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                  } else if (sortKey === 'date_oldest') {
                    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                  } else if (sortKey === 'amount_high') {
                    return (b.payment?.total || 0) - (a.payment?.total || 0);
                  } else if (sortKey === 'amount_low') {
                    return (a.payment?.total || 0) - (b.payment?.total || 0);
                  }
                  return 0;
                })
                .map((booking) => {
                const statusTheme = getStatusColor(booking.status || 'Pending');
                const isHome = booking.collection?.type === 'Home Collection';
                return (
                  <div 
                    key={booking.id}
                    className="admin-table-row admin-mobile-grid-row grid lg:grid-cols-[1.2fr_2fr_1.5fr_1.5fr_1fr_1fr] items-center p-4 lg:px-6 lg:py-4 border border-white/80 transition-colors duration-200 cursor-pointer rounded-2xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.5)'}
                  >
                    <div data-label="Order ID" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{booking.id}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }) : 'N/A'}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: isHome ? '#3b82f6' : '#8b5cf6', backgroundColor: isHome ? '#eff6ff' : '#f3e8ff', display: 'inline-flex', padding: '2px 8px', borderRadius: '12px', alignSelf: 'flex-start' }}>{booking.collection?.type || 'Home Collection'}</div>
                    </div>
                    
                    <div data-label="Patient Details">
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{booking.patient?.name || 'Unknown Patient'}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>{booking.patient?.phone || 'N/A'}</div>
                    </div>
                    
                    <div data-label="Schedule">
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{booking.collection?.date || 'Scheduled'}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>{booking.collection?.timeSlot || 'Flexible'}</div>
                    </div>

                    <div data-label="Tests">
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                        {(booking.items || []).map((t, i) => <div key={i}>{t.name}</div>)}
                      </div>
                    </div>
                    
                    <div data-label="Status">
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: statusTheme.bg, padding: '6px 12px', borderRadius: '20px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusTheme.dot }}></span>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: statusTheme.text }}>{booking.status || 'Pending'}</span>
                      </div>
                    </div>
                    
                    <div data-label="Amount" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>₹{booking.payment?.total ?? 0}</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: booking.payment?.status === 'Paid' ? '#dcfce7' : (booking.payment?.status === 'Failed' ? '#fee2e2' : '#fef9c3'), color: booking.payment?.status === 'Paid' ? '#166534' : (booking.payment?.status === 'Failed' ? '#991b1b' : '#854d0e') }}>
                        {booking.payment?.status || 'Pending'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </AdminPageTemplate>
  );
}
