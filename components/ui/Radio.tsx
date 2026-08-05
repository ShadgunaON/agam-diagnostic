import React, { forwardRef } from 'react';

export type RadioProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Reusable Radio primitive (Native HTML Input type radio).
 * Supports standard HTML input attributes and forwardRef.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        type="radio"
        className={`peer aspect-square h-4 w-4 shrink-0 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 accent-primary ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Radio.displayName = 'Radio';
