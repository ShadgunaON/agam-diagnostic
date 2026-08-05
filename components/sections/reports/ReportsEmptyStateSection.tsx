import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export interface ReportsEmptyStateSectionProps {
  title: string;
  description: string;
  icon: string;
  actionLabel: string;
  actionUrl: string;
  className?: string;
}

export function ReportsEmptyStateSection({ 
  title, 
  description, 
  icon, 
  actionLabel, 
  actionUrl,
  className = '' 
}: ReportsEmptyStateSectionProps) {
  return (
    <section className={`section min-h-[50vh] flex items-center justify-center ${className}`}>
      <div className="container max-w-lg text-center">
        <div className="bg-bg-alt border border-border rounded-2xl p-12 shadow-sm flex flex-col items-center">
          <div className="text-6xl mb-6">{icon}</div>
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground mb-8 text-center max-w-sm">
            {description}
          </p>
          <Button href={actionUrl} className="btn btn--primary">

            {actionLabel}
          
</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-6 uppercase tracking-widest font-bold">Architecture Placeholder</p>
      </div>
    </section>
  );
}
