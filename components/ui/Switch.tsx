import React, { forwardRef } from 'react';

export type SwitchProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Reusable Switch primitive (styled Checkbox).
 * Supports standard HTML input attributes and forwardRef.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          ref={ref}
          {...props}
        />
        <div className={`w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${className}`}></div>
      </div>
    );
  }
);
Switch.displayName = 'Switch';
