import React from 'react';
import { Section, Container, Grid } from '@/components/ui';

export interface AccreditationItem {
  title: string;
  description: string;
}

export interface AwardItem {
  title: string;
  category: string;
  description: string;
}

export interface RecognitionsData {
  accreditations: {
    title: string;
    intro: string;
    items: AccreditationItem[];
  };
  awards: {
    title: string;
    items: AwardItem[];
  };
}

export interface RecognitionsSectionProps {
  data: RecognitionsData;
  className?: string;
}

export function RecognitionsSection({ data, className = '' }: RecognitionsSectionProps) {
  return (
    <section className={`py-16 md:py-24 bg-white ${className}`}>
      <div className="container mx-auto px-4">
        
        {/* Accreditations */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-primary mb-4">{data.accreditations.title}</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
              {data.accreditations.intro}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {data.accreditations.items.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-border shadow-sm p-6 md:p-8 flex flex-col items-center text-center">
                <div className="bg-[#0284C7] text-white text-sm font-medium px-6 py-2 rounded-full mb-6">
                  {item.title}
                </div>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Awards */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-primary mb-4">{data.awards.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.awards.items.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-border shadow-sm p-6 md:p-8 flex flex-col items-center text-center">
                <div className="bg-[#0284C7] text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                  {item.category}
                </div>
                <h3 className="text-foreground font-bold text-lg mb-4 leading-tight">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
