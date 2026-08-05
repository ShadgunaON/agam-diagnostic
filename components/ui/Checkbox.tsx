import React, { forwardRef } from 'react';

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Reusable Checkbox primitive (Native HTML Input type checkbox).
 * Supports standard HTML input attributes and forwardRef.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={`peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 accent-primary ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Checkbox.displayName = 'Checkbox';
