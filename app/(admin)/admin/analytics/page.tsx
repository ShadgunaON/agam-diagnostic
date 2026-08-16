'use client';

import React, { useState, useEffect } from 'react';
import { AdminIcon } from '@/components/admin/navigation/AdminIcons';
import { AdminPageTemplate } from '@/components/admin/layout/AdminPageTemplate';
import { useToast } from '@/components/admin/feedback/Toast';
import { analyticsService } from '@/services';

// --- STYLES ---
const glassStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
  borderRadius: '24px',
};

const formatCurrency = (value: number): string => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString()}`;
};

export default function GlassAnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const [timeFilter, setTimeFilter] = useState<'1D' | '7D' | '1M' | '1Y'>('1D');

  // --- LIVE DATA STATE ---
  const [kpis, setKpis] = useState({ bookingsToday: 0, pendingBookings: 0, homeCollections: 0, revenueToday: 0 });
  const [revenueByMonth, setRevenueByMonth] = useState<Array<{ month: string; revenue: number }>>([]);
  const [testDistribution, setTestDistribution] = useState<Array<{ name: string; value: number; color: string }>>([]);

  useEffect(() => {
    setMounted(true);
    const loadAnalytics = async () => {
      const [kpisData, revenueData, distData] = await Promise.all([
        analyticsService.getDashboardKPIs(),
        analyticsService.getRevenueByMonth(),
        analyticsService.getTestDistribution(),
      ]);
      setKpis(kpisData);
      setRevenueByMonth(revenueData.filter(d => d.revenue > 0));
      setTestDistribution(distData);
    };
    loadAnalytics();
  }, []);

  if (!mounted) return null;

  // Simulate data changing based on time filter
  const multiplier = timeFilter === '1D' ? 1 : timeFilter === '7D' ? 6.5 : timeFilter === '1M' ? 28 : 310;
  const displayKpis = {
    bookingsToday: Math.floor(kpis.bookingsToday * multiplier),
    pendingBookings: Math.floor(kpis.pendingBookings * (multiplier * 0.8)), // Pending doesn't scale as fast as total
    homeCollections: Math.floor(kpis.homeCollections * multiplier),
    revenueToday: kpis.revenueToday * multiplier,
  };

  const maxRevenue = revenueByMonth.length > 0 ? Math.max(...revenueByMonth.map(d => d.revenue)) : 1;
  const totalTestItems = testDistribution.reduce((sum, d) => sum + d.value, 0);

  // Compute doughnut arcs from distribution data
  const circumference = 2 * Math.PI * 40; // ~251.3
  const doughnutArcs: Array<{ color: string; dasharray: string; offset: number }> = [];
  let cumulativeOffset = 0;
  testDistribution.forEach(d => {
    const arcLen = (d.value / 100) * circumference;
    doughnutArcs.push({ color: d.color, dasharray: `${arcLen.toFixed(1)} ${circumference.toFixed(1)}`, offset: -cumulativeOffset });
    cumulativeOffset += arcLen;
  });

  // Derive unique patients from bookings
  const uniquePatients = new Set<string>();
  // We'll count total test items across all bookings for "Tests Conducted"
  const totalItemsCount = 0;
  // These are already computed inside AnalyticsService, but for KPI display we use the kpis object

  const kpiCards = [
    { label: "Total Revenue", value: formatCurrency(displayKpis.revenueToday), icon: 'creditCard', color: '#3b82f6', delta: '+12.5%', isPositive: true },
    { label: "Total Bookings", value: displayKpis.bookingsToday.toString(), icon: 'testTube', color: '#10b981', delta: '+8.2%', isPositive: true },
    { label: "Pending Tests", value: displayKpis.pendingBookings.toString(), icon: 'users', color: '#8b5cf6', delta: '-2.1%', isPositive: true }, // Less pending is good
    { label: "Home Collections", value: displayKpis.homeCollections.toString(), icon: 'mapPin', color: '#f59e0b', delta: '+15.3%', isPositive: true }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminPageTemplate>
      {/* PRINT STYLES */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #analytics-dashboard, #analytics-dashboard * { visibility: visible; }
          #analytics-dashboard { position: absolute; left: 0; top: 0; width: 100%; }
          .print-hide { display: none !important; }
        }
      `}} />
      {/* MESH GRADIENT BACKGROUND */}
      <div 
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0,
          background: 'radial-gradient(circle at 85% 15%, rgba(224, 242, 254, 0.6), transparent 30%), radial-gradient(circle at 15% 85%, rgba(233, 213, 255, 0.6), transparent 30%)',
          backgroundColor: '#f8fafc', overflow: 'hidden', pointerEvents: 'none'
        }}
      />

      <div 
        id="analytics-dashboard"
        className="admin-page-container relative z-10 p-4 lg:p-10 max-w-[1600px] mx-auto flex flex-col gap-4 lg:gap-8 min-h-full min-w-0"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0">
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>Analytics & Reports</h1>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#64748b', margin: '4px 0 0 0' }}>Comprehensive clinical and financial insights.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto print-hide">
            {/* Time Filter Pill */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              {(['1D', '7D', '1M', '1Y'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all ${timeFilter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button 
              onClick={handlePrint}
              style={{ height: '40px', padding: '0 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #0f172a, #334155)', color: '#ffffff', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
            >
              <AdminIcon name="download" style={{ width: '16px', height: '16px' }} /> Export PDF
            </button>
          </div>
        </div>

        {/* GLASS KPI CARDS */}
        <div className="admin-responsive-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi, i) => (
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
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{kpi.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>{kpi.label}</div>
                  <div className={`px-1.5 py-0.5 rounded flex items-center gap-1 text-[11px] font-bold ${kpi.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {kpi.delta}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          
          {/* REVENUE CHART */}
          <div className="p-4 lg:p-8 flex flex-col gap-6 self-start w-full sticky top-6" style={glassStyle}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Revenue by Month</h2>
            <div className="flex justify-between gap-4 relative" style={{ height: '350px', minHeight: '350px' }}>
              {/* Horizontal Grid Lines */}
              <div className="absolute inset-x-0 flex flex-col justify-between pointer-events-none z-0" style={{ top: '40px', bottom: '32px' }}>
                {[1,2,3,4].map(i => <div key={i} style={{ borderTop: '1px dashed rgba(148, 163, 184, 0.3)', width: '100%' }} />)}
              </div>
              
              {/* Bars Container */}
              <div className="absolute inset-x-0 flex justify-between gap-4 z-10" style={{ top: '40px', bottom: '32px' }}>
                {revenueByMonth.map((item, i) => {
                  const heightPercentage = maxRevenue > 0 ? Math.max((item.revenue / maxRevenue) * 100, 2) : 0;
                  return (
                    <div key={i} className="flex-1 h-full relative group cursor-pointer">
                      {/* Bar */}
                      <div 
                        className="absolute rounded-t-lg transition-transform duration-200 group-hover:scale-y-[1.02] origin-bottom"
                        style={{ 
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '100%',
                          maxWidth: '40px',
                          height: `${heightPercentage}%`,
                          backgroundColor: '#3b82f6'
                        }} 
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded shadow-lg pointer-events-none whitespace-nowrap z-50">
                          ₹{item.revenue.toLocaleString()}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                      
                      {/* Label */}
                      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[13px] font-semibold text-slate-500 whitespace-nowrap">
                        {item.month}
                      </div>
                    </div>
                  );
                })}
              </div>

              {revenueByMonth.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>No revenue data yet</div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 min-w-0">
            {/* TEST DISTRIBUTION DOUGHNUT */}
            <div className="admin-glass-panel p-4 lg:p-8 flex flex-col gap-8" style={glassStyle}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Test Distribution</h2>
              
              <div className="relative w-full max-w-[200px] h-[200px] mx-auto flex items-center justify-center">
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="16" />
                  {doughnutArcs.map((arc, i) => (
                    <circle key={i} cx="50" cy="50" r="40" fill="none" stroke={arc.color} strokeWidth="16" strokeDasharray={arc.dasharray} strokeDashoffset={arc.offset} />
                  ))}
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a' }}>{displayKpis.bookingsToday}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Bookings</span>
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
                {testDistribution.length === 0 && (
                  <div style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>No test data yet</div>
                )}
              </div>
            </div>

            {/* LIVE ACTIVITY FEED */}
            <div className="admin-glass-panel p-4 lg:p-6 flex flex-col gap-4 flex-1" style={glassStyle}>
              <div className="flex justify-between items-center">
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Live Activity</h2>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Live</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-0 relative">
                {/* Connecting line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-slate-200 z-0"></div>
                
                {[
                  { time: 'Just now', icon: 'testTube', color: '#3b82f6', text: 'New booking received for Lipid Profile', id: 'BK-1093' },
                  { time: '2m ago', icon: 'fileText', color: '#10b981', text: 'Report generated by Dr. Sarah Jenkins', id: 'REP-1044' },
                  { time: '15m ago', icon: 'mapPin', color: '#f59e0b', text: 'Phlebotomist dispatched for collection', id: 'HC-882' },
                  { time: '1h ago', icon: 'userPlus', color: '#8b5cf6', text: 'New patient registered via portal', id: 'PT-8895' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4 p-3 hover:bg-slate-50/50 rounded-xl transition-colors relative z-10 cursor-pointer group">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-white" style={{ backgroundColor: `${act.color}15`, color: act.color }}>
                      <AdminIcon name={act.icon as any} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {act.text} <span className="text-[11px] font-bold text-slate-400 ml-1">({act.id})</span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">{act.time}</div>
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

// Trigger Turbopack recompile again
