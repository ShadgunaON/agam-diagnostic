import React from 'react';
import { Typography, Button } from '@/components/ui';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  title = 'No Data Found', 
  description = 'We could not find any records matching your criteria.', 
  icon,
  action,
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center min-h-[300px] bg-background rounded-xl border border-border ${className}`}>
      {icon ? (
        <div className="text-muted-foreground mb-6 text-5xl opacity-50">{icon}</div>
      ) : (
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"/><path d="M3 16.2V21m0 0h4.8M3 21l6-6"/><path d="M21 7.8V3m0 0h-4.8M21 3l-6 6"/><path d="M3 7.8V3m0 0h4.8M3 3l6 6"/></svg>
        </div>
      )}
      <Typography variant="h3" className="mb-2">{title}</Typography>
      <Typography variant="p" className="text-muted-foreground m-0 max-w-md">{description}</Typography>
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}
