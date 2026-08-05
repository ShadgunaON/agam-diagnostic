import React from 'react';
import { Typography } from '@/components/ui';

export interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LoadingState({ title = 'Loading...', description = 'Please wait while we fetch your data.', className = '' }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center min-h-[300px] bg-background rounded-xl border border-border ${className}`}>
      <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mb-6" aria-label="Loading indicator" />
      <Typography variant="h3" className="mb-2">{title}</Typography>
      <Typography variant="p" className="text-muted-foreground m-0">{description}</Typography>
    </div>
  );
}
