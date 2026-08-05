import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

/**
 * Reusable layout Container primitive.
 * Enforces global horizontal page gutters and maximum constraints via Tailwind's `container` class.
 */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className = '', as: Component = 'div', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn('w-full max-w-[1320px] mx-auto px-6 md:px-8', className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Container.displayName = 'Container';
