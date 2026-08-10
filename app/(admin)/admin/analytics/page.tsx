'use client';

import React, { useState, useEffect } from 'react';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { useToast } from '@/components/admin/feedback/Toast';

// --- MOCK DATA ---
const revenueByMonth = [
  { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 }, { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 59000 }, { month: 'Jun', revenue: 75000 },
  { month: 'Jul', revenue: 82000 }, { month: 'Aug', revenue: 89000 }
];

const testDistribution = [
  { name: 'Hematology', value: 45, color: '#3b82f6' },
  { name: 'Biochemistry', value: 30, color: '#10b981' },
  { name: 'Molecular', value: 15, color: '#8b5cf6' },
  { name: 'Microbiology', value: 10, color: '#f59e0b' }
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

export default function GlassAnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const maxRevenue = Math.max(...revenueByMonth.map(d => d.revenue));

  return (
    <AdminPageTemplate>
      {/* MESH GRADIENT BACKGROUND */}
      <div 
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
          background: 'radial-gradient(circle at 85% 15%, rgba(224, 242, 254, 0.6), transparent 30%), radial-gradient(circle at 15% 85%, rgba(233, 213, 255, 0.6), transparent 30%)',
          backgroundColor: '#f8fafc', overflow: 'hidden', pointerEvents: 'none'
        }}
      />

      <div 
        className="admin-page-container relative z-10 p-4 lg:p-10 max-w-[1600px] mx-auto flex flex-col gap-4 lg:gap-8 min-h-full min-w-0"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Analytics & Reports</h1>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', margin: '4px 0 0 0' }}>Comprehensive clinical and financial insights.</p>
          </div>
          <button 
            onClick={() => toast({ title: 'Exporting PDF...', description: 'Your report will download shortly.', variant: 'info' })}
            style={{ height: '44px', padding: '0 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0f172a, #334155)', color: '#ffffff', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
          >
            <AdminIcon name="download" style={{ width: '16px', height: '16px' }} /> Export PDF
          </button>
        </div>

        {/* GLASS KPI CARDS */}
        <div className="admin-responsive-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Revenue", value: '₹4.2M', icon: 'creditCard', trend: '+15.2%', color: '#3b82f6' },
            { label: "Tests Conducted", value: '12.4K', icon: 'testTube', trend: '+8.4%', color: '#10b981' },
            { label: "Active Patients", value: '8.2K', icon: 'users', trend: '+12.1%', color: '#8b5cf6' },
            { label: "Home Visits", value: '3.1K', icon: 'mapPin', trend: '+22.5%', color: '#f59e0b' }
          ].map((kpi, i) => (
              <div 
              key={i} 
              className="p-4 lg:p-6 flex flex-col gap-4"
              style={{
                ...glassStyle,
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
              <div className="flex justify-between items-center">
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: `rgba(255,255,255, 0.8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <AdminIcon name={kpi.icon as any} style={{ width: '22px', height: '22px' }} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#10b981', backgroundColor: 'rgba(255,255,255,0.7)', padding: '4px 10px', borderRadius: '20px' }}>
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

        {/* BOTTOM SECTIONS */}
        <div className="admin-responsive-grid-2col grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          
          {/* REVENUE CHART */}
          <div className="p-4 lg:p-8 flex flex-col gap-6" style={glassStyle}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Revenue Growth (YTD)</h2>
            <div className="flex-1 flex items-end justify-between gap-4 pt-10 relative">
              {/* Horizontal Grid Lines */}
              <div className="absolute top-0 inset-x-0 bottom-6 flex flex-col justify-between pointer-events-none z-0">
                {[1,2,3,4].map(i => <div key={i} style={{ borderTop: '1px dashed rgba(148, 163, 184, 0.3)', width: '100%' }} />)}
              </div>
              
              {/* Bars */}
              {revenueByMonth.map((item, i) => {
                const heightPercentage = (item.revenue / maxRevenue) * 100;
                return (
                  <div key={i} className="flex flex-col items-center gap-3 flex-1 h-full justify-end z-10 cursor-pointer relative">
                    <div 
                      style={{ 
                        width: '100%', maxWidth: '40px', height: `${heightPercentage}%`, 
                        background: 'linear-gradient(to top, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, 0.8))',
                        borderRadius: '8px 8px 0 0', transition: 'all 0.2s' 
                      }} 
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(to top, rgba(37, 99, 235, 0.6), rgba(37, 99, 235, 1))';
                        e.currentTarget.style.transform = 'scaleY(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(to top, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, 0.8))';
                        e.currentTarget.style.transform = 'none';
                      }}
                    />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{item.month}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TEST DISTRIBUTION DOUGHNUT */}
          <div className="admin-glass-panel p-4 lg:p-8 flex flex-col gap-8 min-w-0" style={glassStyle}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Test Distribution</h2>
            
            <div className="relative w-full max-w-[200px] h-[200px] mx-auto flex items-center justify-center">
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="16" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="16" strokeDasharray="113 251" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="16" strokeDasharray="75 251" strokeDashoffset="-113" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="16" strokeDasharray="37 251" strokeDashoffset="-188" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="16" strokeDasharray="26 251" strokeDashoffset="-225" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>1,248</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Total Tests</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {testDistribution.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{item.value}%</span>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </AdminPageTemplate>
  );
}
