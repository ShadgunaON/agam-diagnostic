import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export interface ServiceDetailSidebarProps {
  otherServices: Array<{ title: string; slug: string }>;
  className?: string;
}

export function ServiceDetailSidebar({ otherServices, className = '' }: ServiceDetailSidebarProps) {
  return (
    <aside className={`sticky top-24 ${className}`.trim()}>
      <div className="bg-blue-50 border border-primary rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-xl font-bold text-primary mb-3">Book Home Collection</h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Get your tests done from the comfort of your home. Our phlebotomists are trained for safe and hygienic sample collection.
        </p>
        <Button href="/book" variant="primary" className="w-full mb-3">
          Book Appointment
        </Button>
        <Button href="tel:+918940894079" variant="outline" className="w-full">
          Call +91 89408 94079
        </Button>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Why Choose AGAM?
        </h3>
        <ul className="flex flex-col gap-3 m-0 p-0 list-none">
          <li className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-green-500 mt-1 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>NABL Accredited Lab</li>
          <li className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-green-500 mt-1 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>Advanced Technology</li>
          <li className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-green-500 mt-1 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>Expert Pathologists</li>
          <li className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-green-500 mt-1 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>Same Day Reports</li>
          <li className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-green-500 mt-1 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>Free Home Collection</li>
        </ul>
      </div>

      <div className="bg-white border border-border rounded-xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Other Services</h3>
        <ul className="flex flex-col m-0 p-0 list-none">
          {otherServices.map((service, idx) => (
            <li 
              key={idx} 
              className={`py-3 ${idx === otherServices.length - 1 ? '' : 'border-b border-border'}`}
            >
              <Link 
                href={`/services/${service.slug}`} 
                className="flex justify-between items-center text-sm text-slate-600 hover:text-primary transition-colors group"
              >
                {service.title} <span className="text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-slate-900 text-white border-none rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-3 text-white">Need Help?</h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-6 opacity-90">Our support team is available 24/7 to answer your queries.</p>
        <Button href="https://wa.me/918940894079" variant="secondary" size="sm" className="w-full bg-white text-primary hover:bg-slate-50 border-white" target="_blank" rel="noopener noreferrer">
          Chat on WhatsApp
        </Button>
      </div>
    </aside>
  );
}
