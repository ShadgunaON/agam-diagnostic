import React from 'react';
import Link from 'next/link';

export interface ServiceCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  href?: string;
  className?: string;
  delay?: number;
  features?: string[];
  sample?: string;
  turnaround?: string;
  homeCollection?: boolean;
}

export function ServiceCard({ 
  title, 
  description, 
  icon, 
  href = '/services', 
  className = '', 
  features,
  sample,
  turnaround,
  homeCollection
}: ServiceCardProps) {
  return (
    <div className={`group relative flex flex-col h-full ${className}`}>
      {/* Base Card */}
      <Link
        href={href}
        aria-label={title}
        className="card card--service fade-in relative transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(14,165,233,0.06)] hover:border-sky-300/60 focus-within:-translate-y-1.5 focus-within:shadow-[0_12px_32px_rgba(14,165,233,0.06)] overflow-hidden flex flex-col h-full z-10 w-full"
        style={{ textDecoration: 'none' }}
      >
        {/* Subtle Background Overlay on Hover - Cool Blue for Services */}
        <div className="absolute inset-0 bg-sky-50/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>

        <div className="relative z-10 flex flex-col h-full w-full">
          {icon && (
            <div className="icon-box group-hover:scale-105 group-hover:-translate-y-0.5 transition-transform duration-300">
              {icon}
            </div>
          )}
          <h3 className="card__title">{title}</h3>
          
          <div className="mt-auto pt-5 relative z-10 flex items-center text-primary font-bold text-sm group-hover:text-primary-dark transition-colors">
            View Details
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </div>
        </div>
      </Link>

      {/* Floating Capsule Tooltip (Revealed on hover) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+16px)] w-[280px] bg-slate-900 text-slate-100 p-4 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-300 z-50 transform translate-y-4 group-hover:translate-y-0">
        {(features && features.length > 0) || sample || turnaround || homeCollection ? (
          <div className="flex flex-col h-full justify-start w-full">
            {features && features.length > 0 && (
              <div className="mb-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">What it covers</h4>
                <ul className="flex flex-col gap-1 m-0 p-0 list-none">
                  {features.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-[13px] font-semibold text-slate-200 flex items-start gap-1.5 leading-snug">
                      <span className="text-primary mt-[2px] opacity-80 text-[10px]">●</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-auto pt-3 border-t border-slate-700 flex flex-col gap-1.5">
              {sample && (
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-slate-400 font-medium">Sample:</span>
                  <span className="text-slate-200 font-bold">{sample}</span>
                </div>
              )}
              {turnaround && (
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-slate-400 font-medium">Turnaround:</span>
                  <span className="text-slate-200 font-bold">{turnaround}</span>
                </div>
              )}
              {homeCollection && (
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-slate-400 font-medium">Home Collection:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeWidth="3"/></svg>
                    Available
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-[13px] m-0 text-slate-300">{description}</p>
        )}
        
        {/* Tooltip Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}
