import React, { forwardRef } from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

/**
 * Reusable Select primitive (Native HTML Select).
 * Supports standard HTML select attributes, error states, and forwardRef.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, error, ...props }, ref) => {
    return (
      <select
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? 'border-destructive focus:ring-destructive' : ''
        } ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';
