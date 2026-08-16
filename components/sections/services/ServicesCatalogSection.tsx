"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Section, Container, Grid, Card } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';

import { ServiceItem } from '@/domains/services/model';

export interface ServicesCatalogSectionProps {
  data: ServiceItem[];
  className?: string;
}

export function ServicesCatalogSection({ data, className = '' }: ServicesCatalogSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleData = showAll ? data : data.slice(0, 3);
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    });

    const cards = containerRef.current.querySelectorAll('.fade-in');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [visibleData]);

  const parsePrice = (priceStr?: string) => {
    if (!priceStr) return 499;
    const cleaned = priceStr.replace(/\D/g, '');
    return cleaned ? parseInt(cleaned, 10) : 499;
  };

  const getIcon = (iconName: string) => {
    const style = { width: '24px', height: '24px' };
    switch (iconName) {
      case 'checkup':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
      case 'dna':
      case 'genetics':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
      case 'microscope':
      case 'molecular':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
      case 'rt-pcr':
      case 'pcr':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
      case 'microbiology':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
      case 'immunology':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
      default:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}><circle cx="12" cy="12" r="10"/></svg>;
    }
  };

  return (
    <Section id="services-grid" className={`section ${className}`.trim()} ref={containerRef}>
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleData.map((service, idx) => (
            <div key={idx} className="group relative flex flex-col h-full">
              {/* Base Card */}
              <div className="card card--service-premium fade-in relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(14,165,233,0.06)] hover:border-sky-300/60 focus-within:-translate-y-1.5 focus-within:shadow-[0_12px_32px_rgba(14,165,233,0.06)] flex flex-col h-full bg-white rounded-[24px] border border-[rgba(255,255,255,0.1)] z-10 w-full">
                
                {/* Subtle Background Overlay on Hover - Cool Blue for Services */}
                <div className="absolute inset-0 bg-sky-50/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>

                <div className="relative z-10 flex flex-col h-full p-6 w-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md w-fit bg-slate-100 text-slate-600">
                      {service.category}
                    </div>
                    <div className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-lg text-primary group-hover:scale-105 group-hover:-translate-y-0.5 transition-transform duration-300">
                      {getIcon(service.icon)}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-2 group-hover:text-sky-900 transition-colors">
                    <Link href={`/services/${service.slug}`} className="after:absolute after:inset-0 text-inherit no-underline">
                      {service.title}
                    </Link>
                  </h3>

                  <div className="mt-auto relative z-20 flex justify-between items-center pt-4 border-t border-slate-100 group-hover:border-sky-100 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Starting From</span>
                      <span className="font-extrabold text-sky-700 text-[18px] group-hover:scale-105 origin-left transition-transform duration-300">₹{parsePrice(service.price)}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Link href={`/services/${service.slug}`} className="text-[13px] font-bold text-sky-700 hover:text-sky-800 transition-colors group-hover:opacity-100 hidden md:flex items-center">
                        Details <svg className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </Link>
                      {(() => {
                        const numPrice = parsePrice(service.price);
                        const cartItem = items.find(i => i.id === `service-${service.slug}`);
                        
                        return cartItem ? (
                          <div className="flex items-center gap-2 border border-sky-500 rounded-lg p-0.5 bg-sky-50/50 shadow-sm relative z-30">
                            <button type="button" className="w-7 h-7 flex items-center justify-center text-sky-600 font-bold cursor-pointer bg-white rounded-md shadow-sm border border-sky-100 hover:bg-sky-50 transition-colors" onClick={(e) => { e.preventDefault(); if (cartItem.quantity <= 1) { removeItem(cartItem.id); } else { updateQuantity(cartItem.id, -1); } }}>-</button>
                            <span className="text-sm font-bold text-slate-700 min-w-[16px] text-center">{cartItem.quantity}</span>
                            <button type="button" className="w-7 h-7 flex items-center justify-center text-sky-600 font-bold cursor-pointer bg-white rounded-md shadow-sm border border-sky-100 hover:bg-sky-50 transition-colors" onClick={(e) => { e.preventDefault(); updateQuantity(cartItem.id, 1); }}>+</button>
                          </div>
                        ) : (
                          <button type="button" className="px-4 py-2 bg-slate-900 text-white text-[13px] font-bold rounded-lg shadow-sm group-hover:bg-sky-600 transition-colors duration-300 relative z-30" onClick={(e) => { e.preventDefault(); addItem({ id: `service-${service.slug}`, slug: service.slug, title: service.title, type: 'test', category: service.category || 'Diagnostic Service', price: numPrice, originalPrice: Math.round(numPrice * 1.3) }); }}>
                            + Add
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Capsule Tooltip (Revealed on hover) */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+16px)] w-[280px] bg-slate-900 text-slate-100 p-4 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-300 z-50 transform translate-y-4 group-hover:translate-y-0">
                <div className="flex flex-col h-full justify-start w-full">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">About</h4>
                  <p className="text-[13px] text-slate-200 font-medium leading-snug line-clamp-2 m-0 mb-3">{service.description}</p>
                  
                  <div className="mt-auto pt-3 border-t border-slate-700 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-slate-400 font-medium">Home Collection:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeWidth="3"/></svg>
                        Available
                      </span>
                    </div>
                  </div>
                </div>
                {/* Tooltip Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-slate-900"></div>
              </div>
            </div>
          ))}
        </div>
        
        {data.length > 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--sp-8)' }}>
            <Button onClick={() => setShowAll(!showAll)} variant="outline">
              {showAll ? 'View Less' : 'View All Services'}
            </Button>
          </div>
        )}
      </Container>
    </Section>
  );
}
