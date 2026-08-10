import React from 'react';
import { BookingModel } from '@/domains/booking/model';

export interface BookingSidebarProps {
  data: BookingModel;
  className?: string;
  pillText?: string;
  title?: React.ReactNode;
  description?: string;
}

export function BookingSidebar({ 
  data, 
  className = '',
  pillText = 'Smart Booking Step 2 of 3',
  title = <>Schedule<br />Test</>,
  description = 'Build your cart and schedule a free home collection.'
}: BookingSidebarProps) {
  return (
    <div className={`booking-summary space-y-6 ${className}`} id="sidebar-content">
      <div className="space-y-3">
        <span className="booking-summary__pill text-xs font-extrabold uppercase tracking-wider bg-white/15 text-white/90 border border-white/20 inline-block px-3 py-1 rounded-full">
          {pillText}
        </span>
        <h1 className="booking-summary__title text-4xl sm:text-5xl font-black text-white leading-none tracking-tight m-0">
          {title}
        </h1>
        <p className="text-white/80 text-sm leading-relaxed max-w-xs m-0">{description}</p>
      </div>

      <div className="space-y-2.5 pt-4 border-t border-white/15">
        <div className="text-xs font-bold text-white/90 uppercase tracking-wider mb-2">AGAM Trust Guarantees</div>
        {data.trustFeatures?.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2.5 text-xs text-white/90 font-semibold bg-white/10 p-2.5 rounded-xl border border-white/10 backdrop-blur-xs">
            <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" className="w-4 h-4 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
            {feature.title}
          </div>
        ))}
      </div>

      <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-xs text-white/90 space-y-1">
        <p className="font-bold text-white mb-0.5 flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-yellow-300"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          NABL Accredited Lab
        </p>
        <p className="text-xs text-white/70 m-0">100% automated analyzers with dual-verification by senior pathologists.</p>
      </div>
    </div>
  );
}
