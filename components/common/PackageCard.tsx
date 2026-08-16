"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export interface PackageCardProps {
  title: string;
  price: string;
  description: string;
  features?: string[];
  category?: string;
  isPopular?: boolean;
  className?: string;
}

/**
 * Package Card — matches approved HTML wireframe index.html lines 286-313.
 * Uses .card--package styling from wireframe CSS:
 * - White background (NOT gradient)
 * - border: 1px solid var(--border-glass-dark) = rgba(255,255,255,0.1)
 * - radius: var(--radius-xl) = 24px
 * - shadow: inset ring + shadow-sm
 * - Hover: inset ring + shadow-premium, translateY(-4px) scale(1.01)
 * - ::before: navy radial gradient (NOT emerald)
 *
 * NO emerald-green theming. NO wellness gradients.
 */
export function PackageCard({ title, price, description, category = 'Preventive Health', isPopular, className = '', features }: PackageCardProps) {
  const { addItem } = useCart();
  const router = useRouter();

  const handleBookNow = (e: React.MouseEvent) => {
    e.preventDefault();
    const id = `pkg-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const item = {
      id,
      title,
      price: parseInt(price.replace(/[^0-9]/g, ''), 10) || 999,
      type: 'package' as const,
      category,
      slug: id
    };
    addItem(item);
    router.push('/book');
  };

  return (
    <div className={`group relative flex flex-col h-full ${className}`}>
      {/* Base Card */}
      <div className="card--package fade-in relative transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.06)] hover:border-slate-300/60 focus-within:-translate-y-1.5 focus-within:shadow-[0_12px_32px_rgba(15,23,42,0.06)] overflow-hidden flex flex-col h-full z-10">
        
        {/* Subtle Background Overlay on Hover */}
        <div className="absolute inset-0 bg-slate-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>

        <div className="relative z-10 flex flex-col h-full">
          {isPopular && <div className="card--package__badge">Most Popular</div>}
          <div className="card--package__category">{category}</div>
          <h3 className="card--package__title group-hover:text-slate-900 transition-colors">{title}</h3>
          
          <div className="card--package__footer mt-auto pt-6 relative z-10">
            <div className="card--package__price group-hover:scale-105 origin-left transition-transform duration-300">{price}</div>
            <button 
              type="button" 
              onClick={handleBookNow} 
              className="card--package__btn group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Floating Capsule Tooltip (Revealed on hover) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+16px)] w-[280px] bg-slate-900 text-slate-100 p-4 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-300 z-50 transform translate-y-4 group-hover:translate-y-0">
        {features && features.length > 0 ? (
          <div className="flex flex-col justify-start">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">What's Included</h4>
            <ul className="flex flex-col gap-1.5 m-0 p-0 list-none">
              {features.slice(0, 4).map((f, i) => (
                <li key={i} className="text-[13px] font-semibold text-slate-200 flex items-start gap-2 leading-snug">
                  <span className="text-primary mt-[2px] opacity-80 text-[10px]">●</span>
                  <span>{f}</span>
                </li>
              ))}
              {features.length > 4 && (
                <li className="text-[12px] font-semibold text-slate-400 mt-1 pl-4">
                  + {features.length - 4} more tests
                </li>
              )}
            </ul>
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
