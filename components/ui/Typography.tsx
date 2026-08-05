import React, { forwardRef } from 'react';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
}

/**
 * Reusable Typography primitive.
 * Enforces standard typography scales and margins.
 */
export const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ className = '', as, variant = 'p', children, ...props }, ref) => {
    const Component = as || variant;

    return (
      <Component
        ref={ref}
        className={className ? className.trim() : undefined}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Typography.displayName = 'Typography';
