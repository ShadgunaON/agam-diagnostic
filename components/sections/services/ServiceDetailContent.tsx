import React from 'react';
import Link from 'next/link';
import { ServiceDetailData } from '@/domains/services/model';
import { Grid } from '@/components/ui';

export interface ServiceDetailContentProps {
  data: ServiceDetailData;
  className?: string;
}

export function ServiceDetailContent({ data, className = '' }: ServiceDetailContentProps) {
  const getPropIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
      case 1:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
      case 2:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
      case 3:
      default:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    }
  };

  return (
    <div className={`prose prose-slate max-w-none ${className}`.trim()}>
      <div className="flex flex-wrap gap-4 bg-slate-50 border border-border rounded-xl p-4 mb-8">
        {data.valueProps.map((prop, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
            <span className="text-primary [&>svg]:w-5 [&>svg]:h-5">{getPropIcon(idx)}</span> {prop.title}
          </div>
        ))}
      </div>
      
      <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-primary mb-4">{data.category}</span>
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">{data.title}</h1>
      <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-[65ch]">{data.shortDescription}</p>

      <div className="bg-slate-50 rounded-2xl h-[280px] flex items-center justify-center text-[64px] mb-8 border border-slate-100 shadow-inner">
        {data.icon}
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">About This Service</h2>
      <div className="text-slate-600 leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: data.aboutHtml }} />

      <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Who Should Use This Service?</h2>
      <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-12">
        {data.whoShouldUse.map((item, idx) => (
          <li key={idx} className="pl-2">{item}</li>
        ))}
      </ul>

      <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Process Overview</h2>
      <Grid gap="6" className="grid-cols-1 sm:grid-cols-2 mb-12">
        {data.process.map((step, idx) => (
          <div key={idx} className="bg-slate-50 p-6 rounded-xl border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all duration-300">
            <h4 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h4>
            <p className="text-sm text-slate-600 m-0 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </Grid>

      <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Preparation</h2>
      <div className="bg-amber-50 border border-amber-200 text-amber-900 p-6 rounded-xl mb-12 flex gap-4 items-start shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 shrink-0 text-amber-600 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <h4 className="font-bold text-amber-900 mb-1 m-0">{data.preparation.title}</h4>
          <p className="text-sm m-0 text-amber-800/90 leading-relaxed">{data.preparation.description}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Frequently Asked Questions</h2>
      <div className="border border-border rounded-xl p-6 mb-12 bg-white shadow-sm">
        {data.faqs.map((faq, idx) => (
          <div key={idx} className={`${idx === data.faqs.length - 1 ? '' : 'border-b border-border pb-4 mb-4'}`}>
            <h4 className="text-base font-bold text-slate-900 mb-2 m-0">{faq.question}</h4>
            <p className="text-sm text-slate-600 m-0 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Related Tests</h2>
      <Grid gap="6" className="grid-cols-1 sm:grid-cols-2">
        {data.relatedTests.map((test, idx) => (
          <Link key={idx} href={`/tests/${test.slug}`} className="group flex flex-col bg-white border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 w-fit mb-3">{test.category}</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors m-0">{test.title}</h3>
            <p className="text-sm text-slate-500 m-0 line-clamp-2 leading-relaxed">{test.description}</p>
          </Link>
        ))}
      </Grid>
    </div>
  );
}
