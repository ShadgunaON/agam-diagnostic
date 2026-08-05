import React from 'react';
import { Typography, Button } from '@/components/ui';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  description = 'An error occurred while loading this content. Please try again later.', 
  icon,
  action,
  className = '' 
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center min-h-[300px] bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50 ${className}`}>
      {icon ? (
        <div className="text-destructive mb-6 text-5xl">{icon}</div>
      ) : (
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 text-destructive rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
        </div>
      )}
      <Typography variant="h3" className="mb-2 text-foreground">{title}</Typography>
      <Typography variant="p" className="text-muted-foreground m-0 max-w-md">{description}</Typography>
      {action && (
        <Button onClick={action.onClick} variant="outline" className="mt-6 border-destructive/20 hover:bg-destructive/10">
          {action.label}
        </Button>
      )}
    </div>
  );
}
