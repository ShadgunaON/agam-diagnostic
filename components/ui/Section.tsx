import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

/**
 * Reusable layout Section primitive.
 * Enforces the canonical macro-vertical rhythm between page sections.
 */
export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className = '', as: Component = 'section', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn('py-20 md:py-24', className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Section.displayName = 'Section';
