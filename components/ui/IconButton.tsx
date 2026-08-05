import React, { forwardRef } from 'react';

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Reusable IconButton primitive.
 * A button specifically styled to house an icon.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-md p-2 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';
