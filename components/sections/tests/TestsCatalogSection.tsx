"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { TestItem, TestCategory } from '@/domains/tests/model';
import { useCart } from '@/context/CartContext';

export interface TestsCatalogSectionProps {
  categories: TestCategory[];
  catalog: TestItem[];
  className?: string;
}

export function TestsCatalogSection({ categories, catalog, className = '' }: TestsCatalogSectionProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredTests = activeFilter === 'all' 
    ? catalog 
    : catalog.filter(test => test.category === activeFilter);

  const parsePrice = (priceStr?: string) => {
    if (!priceStr) return 499;
    const cleaned = priceStr.replace(/\D/g, '');
    return cleaned ? parseInt(cleaned, 10) : 499;
  };

  // Re-initialize intersection observer for dynamically rendered cards
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
  }, [filteredTests]);

  return (
    <section className={`section ${className}`.trim()} ref={containerRef}>
      <div className="container">
        <div className="filter-tabs" style={{ marginBottom: 'var(--sp-8)' }}>
          {categories.map((cat) => (
            <button 
              key={cat.id}
              className={`filter-tab filter-tab--premium ${activeFilter === cat.id ? 'is-active' : ''}`}
              onClick={() => setActiveFilter(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test, idx) => {
              const numPrice = parsePrice(test.price);
              const cartItem = items.find(i => i.id === `test-${test.slug}` || i.slug === test.slug);
              return (
                <div key={idx} className="group relative flex flex-col h-full">
                  {/* Base Card */}
                  <div className="card card--test-premium fade-in relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(20,184,166,0.06)] hover:border-teal-300/60 focus-within:-translate-y-1.5 focus-within:shadow-[0_12px_32px_rgba(20,184,166,0.06)] flex flex-col h-full bg-white rounded-[24px] border border-[rgba(255,255,255,0.1)] z-10">
                    
                    {/* Subtle Background Overlay on Hover - Soft Cyan for Tests */}
                    <div className="absolute inset-0 bg-teal-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>

                    <div className="relative z-10 flex flex-col h-full min-h-[200px] p-6 w-full">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded-md w-fit mb-4">{test.tag || test.category || 'Lab Test'}</span>
                      
                      <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-2 group-hover:text-teal-900 transition-colors">
                        <Link href={`/tests/${test.slug}`} className="after:absolute after:inset-0 text-inherit no-underline">
                          {test.title}
                        </Link>
                      </h3>
                    
                    {/* Footer / CTA Area */}
                    <div className="mt-auto relative z-20 flex justify-between items-center pt-4 border-t border-slate-100 group-hover:border-teal-100 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Price</span>
                        <span className="font-extrabold text-teal-700 text-[18px] group-hover:scale-105 origin-left transition-transform duration-300">₹{numPrice}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Link href={`/tests/${test.slug}`} className="text-[13px] font-bold text-teal-700 hover:text-teal-800 transition-colors group-hover:opacity-100 hidden md:flex items-center">
                          Details <svg className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </Link>
                        {cartItem ? (
                          <div className="flex items-center gap-2 border border-teal-500 rounded-lg p-0.5 bg-teal-50/50 shadow-sm relative z-30">
                            <button type="button" className="w-7 h-7 flex items-center justify-center text-teal-600 font-bold cursor-pointer bg-white rounded-md shadow-sm border border-teal-100 hover:bg-teal-50 transition-colors" onClick={(e) => { e.preventDefault(); if (cartItem.quantity <= 1) { removeItem(cartItem.id); } else { updateQuantity(cartItem.id, -1); } }}>-</button>
                            <span className="text-sm font-bold text-slate-700 min-w-[16px] text-center">{cartItem.quantity}</span>
                            <button type="button" className="w-7 h-7 flex items-center justify-center text-teal-600 font-bold cursor-pointer bg-white rounded-md shadow-sm border border-teal-100 hover:bg-teal-50 transition-colors" onClick={(e) => { e.preventDefault(); updateQuantity(cartItem.id, 1); }}>+</button>
                          </div>
                        ) : (
                          <button type="button" className="px-4 py-2 bg-slate-900 text-white text-[13px] font-bold rounded-lg shadow-sm group-hover:bg-teal-600 transition-colors duration-300 relative z-30" onClick={(e) => { e.preventDefault(); addItem({ id: `test-${test.slug}`, slug: test.slug, title: test.title, type: 'test', category: test.category || 'Lab Test', price: numPrice, originalPrice: Math.round(numPrice * 1.3) }); }}>
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Capsule Tooltip (Revealed on hover) */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+16px)] w-[280px] bg-slate-900 text-slate-100 p-4 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-300 z-50 transform translate-y-4 group-hover:translate-y-0">
                    <div className="flex flex-col h-full justify-start w-full">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Purpose</h4>
                      <p className="text-[13px] text-slate-200 font-medium leading-snug line-clamp-2 mb-3 m-0">{test.description || 'A diagnostic test to help monitor and manage your health.'}</p>
                      
                      <div className="mt-auto pt-3 border-t border-slate-700 flex flex-col gap-1.5">
                        {test.sampleType && (
                          <div className="flex justify-between items-center text-[12px]">
                            <span className="text-slate-400 font-medium">Sample:</span>
                            <span className="text-slate-200 font-bold">{test.sampleType}</span>
                          </div>
                        )}
                        {test.turnaroundTime && (
                          <div className="flex justify-between items-center text-[12px]">
                            <span className="text-slate-400 font-medium">TAT:</span>
                            <span className="text-slate-200 font-bold">{test.turnaroundTime}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-[12px]">
                          <span className="text-slate-400 font-medium">Home Collection:</span>
                          <span className={`font-bold flex items-center gap-1 ${
                            test.homeCollectionAvailable !== false ? 'text-emerald-400' : 'text-slate-400'
                          }`}>
                            {test.homeCollectionAvailable !== false ? (
                              <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" strokeWidth="3"/></svg>Available</>
                            ) : 'Not Available'}
                          </span>
                        </div>
                        {test.fastingRequired !== undefined && (
                          <div className="flex justify-between items-center text-[12px]">
                            <span className="text-slate-400 font-medium">Fasting:</span>
                            <span className={`font-bold ${test.fastingRequired ? 'text-orange-400' : 'text-emerald-400'}`}>
                              {test.fastingRequired ? 'Required' : 'Not Required'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">🔬</div>
            <h3>No matching tests found</h3>
            <p>We couldn&apos;t find a test matching your search criteria. Please contact our support team to request a custom test.</p>
            <Link href="/help" className="btn btn--primary">
              Contact Support
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
